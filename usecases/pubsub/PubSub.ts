import EventEmitter from 'events';
import mqtt, { MqttClient, MqttProtocol } from 'mqtt';
import { ulid } from 'ulid';

export interface PubSubAuthData {
  username: string;
  password: string;
}

class PubSub {
  connectionOptions: mqtt.IClientOptions = {
    protocol: (process.env.NEXT_PUBLIC_MQTT_PROTOCOL || 'ws') as MqttProtocol,
    host: process.env.NEXT_PUBLIC_MQTT_HOST || 'localhost',
    port: parseInt(process.env.NEXT_PUBLIC_MQTT_PORT || '8083'),
    clientId: 'webapp-' + ulid(),
    reconnectPeriod: 4000,
    connectTimeout: 10000,
  };
  client: MqttClient;
  eventEmitter: EventEmitter;
  isDebug = Boolean(process.env.NEXT_PUBLIC_DEBUG);

  constructor(authData: PubSubAuthData) {
    const { protocol, host, port } = this.connectionOptions;

    this.connectionOptions.username = authData.username;
    this.connectionOptions.password = authData.password;

    const url = `${protocol}://${host}:${port}/mqtt`;
    this.client = mqtt.connect(url, this.connectionOptions);

    this.eventEmitter = new EventEmitter();

    this.client.on('connect', (...args) => {
      this.eventEmitter.emit('connect', ...args);
      this.eventEmitter.emit('any', 'connect', ...args);
    });
    this.client.on('error', (...args) => {
      this.eventEmitter.emit('error', ...args);
      this.eventEmitter.emit('any', 'error', ...args);
    });
    this.client.on('reconnect', (...args) => {
      this.eventEmitter.emit('reconnect', ...args);
      this.eventEmitter.emit('any', 'reconnect', ...args);
    });
    this.client.on('message', (...args) => {
      this.eventEmitter.emit('message', ...args);
      this.eventEmitter.emit('any', 'message', ...args);
    });
    this.client.on('end', (...args) => {
      this.eventEmitter.emit('end', ...args);
      this.eventEmitter.emit('any', 'end', ...args);
    });
    this.client.on('offline', (...args) => {
      this.eventEmitter.emit('offline', ...args);
      this.eventEmitter.emit('any', 'offline', ...args);
    });

    this.eventEmitter.on('any', (eventName, ...args) => {
      if (!this.isDebug) {
        return;
      }

      if (eventName === 'message') {
        const [topic, msg, ...res] = args;

        console.log(
          `pubsub: ${eventName}:`,
          topic,
          JSON.parse(msg.toString()),
          ...res
        );

        return;
      }

      console.log(`pubsub: ${eventName}:`, args);
    });
  }

  isConnect() {
    return this.client && this.client.connected;
  }

  async disconnect() {
    if (!this.client) {
      return;
    }

    return this.client.endAsync();
  }

  subscribe(
    topic: string,
    cb: (topic: string, msg: Record<string, any>, topicPattern: string) => void
  ) {
    if (!this.client) {
      return () => {};
    }

    this.client.subscribe(topic);
    const cbWrapper = (exactTopic: string, payload: any) => {
      if (!exactTopic.startsWith(topic.split('#')[0])) {
        return;
      }

      const payloadStr = payload.toString();
      const msg = JSON.parse(payloadStr);

      cb(exactTopic, msg, topic);
    };

    this.client.on('message', cbWrapper);

    return () => {
      if (!this.client) {
        return;
      }

      this.client.removeListener('message', cbWrapper);

      try {
        this.client.unsubscribeAsync(topic);
      } catch (err) {
        this.eventEmitter.emit('any', 'error', `unsubscribe ${topic}`, err);
      }
    };
  }

  subscribeAck(
    spaceId: string,
    userId: string,
    cb: (topic: string, msg: Record<string, any>, topicPattern: string) => void
  ) {
    const topic = `${spaceId}/ack/${userId}`;

    return this.subscribe(topic, cb);
  }

  subscribeDeviceUpdate(
    spaceId: string,
    cb: (topic: string, msg: Record<string, any>, topicPattern: string) => void
  ) {
    const topic = `${spaceId}/iot_device/update/#`;

    return this.subscribe(topic, cb);
  }

  subscribeMeasurement(
    spaceId: string,
    cb: (topic: string, msg: Record<string, any>, topicPattern: string) => void
  ) {
    const topic = `${spaceId}/measurement/#`;

    return this.subscribe(topic, cb);
  }

  async publishCommand(
    spaceId: string,
    deviceId: string,
    msg: Record<string, any>
  ) {
    if (!this.client) {
      return;
    }

    const topic = `${spaceId}/command/${deviceId}`;

    return this.client.publishAsync(topic, JSON.stringify(msg)).then((data) => {
      this.eventEmitter.emit('publish', topic, msg);
      this.eventEmitter.emit('any', 'publish', topic, msg);

      return data;
    });
  }
}

export default PubSub;
