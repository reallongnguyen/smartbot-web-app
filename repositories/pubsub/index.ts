import EventEmitter from 'events';
import mqtt, { MqttClient, MqttProtocol } from 'mqtt';
import { ulid } from 'ulid';

class Pubsub {
  connectionOptions = {
    protocol: (process.env.NEXT_PUBLIC_MQTT_PROTOCOL || 'ws') as MqttProtocol,
    host: process.env.NEXT_PUBLIC_MQTT_HOST || 'localhost',
    port: parseInt(process.env.NEXT_PUBLIC_MQTT_PORT || '8083'),
    clientId: 'webapp-' + ulid(),
    autoReconnect: true,
    reconnectPeriod: 4000,
    mqttVersion: '5.0',
    connectTimeout: 10000,
    keepAlive: 60000,
    username: '01G65Z755AFWAKHE12NY0CQ9FH',
    password: '',
  };
  client: MqttClient;
  eventEmitter: EventEmitter;
  isDebug = Boolean(process.env.NEXT_PUBLIC_DEBUG);

  constructor() {
    const { protocol, host, port } = this.connectionOptions;

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

  isClose() {
    return (
      !this.client || this.client.disconnected || this.client.disconnecting
    );
  }

  async disconnect() {
    if (!this.client || (!this.client.connected && !this.client.reconnecting)) {
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
    this.client.on('message', (exactTopic, payload) => {
      if (!exactTopic.startsWith(topic.split('#')[0])) {
        return;
      }

      const payloadStr = payload.toString();
      const msg = JSON.parse(payloadStr);

      cb(exactTopic, msg, topic);
    });

    return () => {
      this.client.unsubscribeAsync(topic);
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

  subscribeDeviceStatus(
    spaceId: string,
    cb: (topic: string, msg: Record<string, any>, topicPattern: string) => void
  ) {
    const topic = `${spaceId}/device_status`;

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

export default Pubsub;
