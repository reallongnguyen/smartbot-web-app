'use client';

import IoTDeviceCard from '@/components/molecules/IoTDevice/IoTDeviceCard';
import { IoTDevice } from '@/components/molecules/IoTDevice/models';
import { useAuthSession } from '@/usecases/auth/AuthContext';
import usePubSub from '@/usecases/pubsub/PubSubContext';
import { useEffect, useState } from 'react';
import { ulid } from 'ulid';

export default function Home() {
  const authSession = useAuthSession();
  const spaceId = authSession?.spaceId || '';
  const userId = authSession?.userId || '';

  const { client } = usePubSub();
  const [devices, setDevices] = useState<Record<string, IoTDevice>>({
    '01HTQ9844VMWWP70AD8HGJ48BY': {
      id: '01HTQ9844VMWWP70AD8HGJ48BY',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:14',
      chipId: '00121314',
      name: 'Switch 1',
      type: 'bot_switch',
      mode: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
    '01HVAJ1N63VW5BAA6SDDWNB88Q': {
      id: '01HVAJ1N63VW5BAA6SDDWNB88Q',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:82',
      chipId: '00121382',
      name: 'ClimaTrack',
      type: 'sensor_env',
      state: 'on',
      connectStatus: 'online',
      deviceData: {
        lastMeasurementAt: new Date().toISOString(),
        measurements: [
          {
            type: 'temperature',
            value: 24,
          },
          {
            type: 'humidity',
            value: 50,
          },
          {
            type: 'light',
            value: 5,
          },
        ],
      },
    },
    '01HVBEYVDGP2YWW1NEPXHNX6VP': {
      id: '01HVBEYVDGP2YWW1NEPXHNX6VP',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:22',
      chipId: '00121322',
      name: 'Outside',
      type: 'sensor_env',
      state: 'off',
      connectStatus: 'online',
      deviceData: {
        lastMeasurementAt: '2024-04-14T06:09:00Z',
        measurements: [
          {
            type: 'temperature',
            value: 40.65,
          },
          {
            type: 'humidity',
            value: 60,
          },
          {
            type: 'light',
            value: 9,
          },
        ],
      },
    },
    '01HTQHX3KXA94E0C4G9MH9D060': {
      id: '01HTQHX3KXA94E0C4G9MH9D060',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:15',
      chipId: '00121315',
      name: 'Switch 2',
      type: 'bot_switch',
      mode: 'button',
      state: 'off',
      connectStatus: 'online',
    },
  });

  const handleCardAction = (device: IoTDevice) => () => {
    switch (device.type) {
      case 'bot_switch':
        if (device.mode === 'button') {
          pressButton(device.id);
        } else {
          toggleSwitch(device.id);
        }

        break;
      default:
        console.log('not supported device');
    }
  };

  const toggleSwitch = (id: string) => {
    if (!devices[id]) {
      return;
    }

    client?.publishCommand(spaceId, id, {
      id: ulid(),
      requesterId: userId,
      command: devices[id].state === 'on' ? 'off' : 'on',
      type: 'functional',
    });
  };

  const pressButton = (id: string) => {
    if (!devices[id]) {
      return;
    }

    client?.publishCommand(spaceId, id, {
      id: ulid(),
      requesterId: userId,
      command: 'on',
      type: 'functional',
    });
  };

  const changeDevice = (id: string, data: Record<string, any>) => {
    setDevices((dvs) => {
      if (!dvs[id]) {
        return dvs;
      }

      const newDevices = { ...dvs };

      newDevices[id] = {
        ...newDevices[id],
        ...data,
      };

      return newDevices;
    });
  };

  useEffect(() => {
    if (!client || !authSession) {
      return;
    }

    const unsubAckCmd = client.subscribeAck(
      authSession.spaceId,
      authSession.userId,
      (topic, msg) => {
        changeDevice(msg.iotDeviceId, { state: msg.newState });
      }
    );

    const unsubDvUpdate = client.subscribeDeviceUpdate(
      authSession.spaceId,
      (topic, msg) => {
        setDevices((dvs) => {
          if (!dvs[msg.iotDeviceId]) {
            return dvs;
          }

          const newDevices = { ...dvs };

          newDevices[msg.iotDeviceId] = {
            ...newDevices[msg.iotDeviceId],
            state: msg.state,
          };

          // make press animation if state of button change
          if (
            newDevices[msg.iotDeviceId].type === 'switch' &&
            newDevices[msg.iotDeviceId].mode === 'button' &&
            dvs[msg.iotDeviceId].state !== msg.state
          ) {
            newDevices[msg.iotDeviceId].state = 'press';

            setTimeout(
              () => changeDevice(msg.iotDeviceId, { state: msg.state }),
              500
            );
          }

          return newDevices;
        });
      }
    );

    const unsubMeasurement = client.subscribeMeasurement(
      authSession.spaceId,
      (topic, msg) => {
        const id = msg.iotDeviceId;

        setDevices((dvs) => {
          const targetDevice = dvs[id];

          if (!targetDevice) {
            return dvs;
          }

          return {
            ...dvs,
            [id]: {
              ...dvs[id],
              deviceData: {
                ...dvs[id].deviceData,
                lastMeasurementAt: msg.timestamp,
                measurements: msg.measurements,
              },
            },
          };
        });
      }
    );

    return () => {
      unsubAckCmd();
      unsubDvUpdate();
      unsubMeasurement();
    };
  }, [authSession, client]);

  return (
    <main className='relative grid grid-rows-[auto_1fr_auto] h-[100dvh]'>
      <header className='h-12 flex items-center px-3'>
        <h1 className='text-lg font-semibold'>Home</h1>
      </header>
      <div className='px-3'>
        <div className='grid grid-cols-2 gap-2'>
          {Object.values(devices).map((device) => (
            <IoTDeviceCard
              device={device}
              action={handleCardAction(device)}
              key={device.id}
            />
          ))}
        </div>
      </div>
      <div className='absolute bottom-0 h-20 w-full bg-white'></div>
    </main>
  );
}
