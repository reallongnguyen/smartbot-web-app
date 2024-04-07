'use client';

import IoTDeviceCard, { IoTDevice } from '@/components/molecules/IoTDeviceCard';
import usePubSub from '@/repositories/pubsub/usePubSub';
import { useEffect, useState } from 'react';
import { ulid } from 'ulid';

export default function Home() {
  const spaceId = '01HTQ9HBANAVTXG95AQWSWGXKK';
  const userId = '01G65Z755AFWAKHE12NY0CQ9FH';
  const client = usePubSub();
  const [devices, setDevices] = useState<IoTDevice[]>([
    {
      id: '01HTQ9844VMWWP70AD8HGJ48BY',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:14',
      chipId: '00121314',
      name: 'Switch 1',
      type: 'switch',
      mode: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTQHX3KXA94E0C4G9MH9D060',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:15',
      chipId: '00121315',
      name: 'Switch 2',
      type: 'switch',
      mode: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTQHXAZNSDCGV000FYAH4M3G',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:16',
      chipId: '00121316',
      name: 'Switch 3',
      type: 'switch',
      mode: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTQHXG81N1KW2N01GCRXT2Q5',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:17',
      chipId: '00121317',
      name: 'Switch 4',
      type: 'switch',
      mode: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTRWS1XEV8HPZY6HS1VS6TRN',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:57',
      chipId: '00121357',
      name: 'Switch 5',
      type: 'switch',
      mode: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTRKPKMGMGK7QRNC1RDAY8DV',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:18',
      chipId: '00121318',
      name: 'Button 1',
      type: 'switch',
      mode: 'button',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTRKQ0MATTY0CFYQ3MC9HQC7',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:19',
      chipId: '00121319',
      name: 'Button 2',
      type: 'switch',
      mode: 'button',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTRKQ8Q9GJ063B08TGACQZK0',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:20',
      chipId: '00121320',
      name: 'Button 3',
      type: 'switch',
      mode: 'button',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTRKQJ2N3V2E3THC14QSQ3T8',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:21',
      chipId: '00121321',
      name: 'Button 4',
      type: 'switch',
      mode: 'button',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTRWSH9K3GWY1KWDJ2Y3YT0D',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:22',
      chipId: '00121322',
      name: 'Button 5',
      type: 'switch',
      mode: 'button',
      state: 'off',
      connectStatus: 'online',
    },
  ]);

  const handleCardAction = (device: IoTDevice) => () => {
    switch (device.type) {
      case 'switch':
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
    const device = devices.find((dv) => dv.id === id);
    if (!device) {
      return;
    }

    client.publishCommand(spaceId, id, {
      id: ulid(),
      requesterId: userId,
      command: device.state === 'on' ? 'off' : 'on',
      type: 'functional',
    });
  };

  const pressButton = (id: string) => {
    const idx = devices.findIndex((dv) => dv.id === id);
    if (idx < 0) {
      return;
    }

    const newDevices = [...devices];
    newDevices[idx] = {
      ...newDevices[idx],
      state: 'press',
    };
    setDevices(newDevices);

    client.publishCommand(spaceId, id, {
      id: ulid(),
      requesterId: userId,
      command: 'on',
      type: 'functional',
    });
  };

  useEffect(() => {
    const unsubAckCmd = client.subscribeAck(spaceId, userId, (topic, msg) => {
      setDevices((dvs) => {
        const newDevices = [...dvs];

        const idx = newDevices.findIndex((dv) => dv.id === msg.iotDeviceId);
        if (idx >= 0) {
          newDevices[idx] = {
            ...newDevices[idx],
            state: msg.newState,
          };
        }

        return newDevices;
      });
    });

    const unsubDvStatus = client.subscribeDeviceStatus(
      spaceId,
      (topic, msg) => {
        setDevices((dvs) => {
          const newDevices = [...dvs];

          const idx = newDevices.findIndex((dv) => dv.id === msg.iotDeviceId);
          if (idx >= 0) {
            newDevices[idx] = {
              ...newDevices[idx],
              state: msg.state,
            };
          }

          return newDevices;
        });
      }
    );

    return () => {
      unsubAckCmd();
      unsubDvStatus();
    };
  }, [client]);

  return (
    <main className='grid grid-rows-[auto_1fr_auto] h-[100dvh] bg-gray-50'>
      <header className='h-12 flex items-center px-3'>
        <h1 className='text-lg font-semibold'>Home</h1>
      </header>
      <div className='px-3'>
        <div className='grid grid-cols-2 gap-2'>
          {devices.map((device) => (
            <IoTDeviceCard
              device={device}
              action={handleCardAction(device)}
              key={device.id}
            />
          ))}
        </div>
      </div>
      <div className='h-20 bg-white'></div>
    </main>
  );
}
