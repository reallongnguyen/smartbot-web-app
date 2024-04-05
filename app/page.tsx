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
      name: 'Công tắc NVS',
      type: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTQHX3KXA94E0C4G9MH9D060',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:15',
      chipId: '00121315',
      name: 'Feed fishes',
      type: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTQHXAZNSDCGV000FYAH4M3G',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:16',
      chipId: '00121316',
      name: 'This is a switch to feed fishes automation',
      type: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
    {
      id: '01HTQHXG81N1KW2N01GCRXT2Q5',
      spaceId: spaceId,
      macAddress: 'fa:cd:ed:12:13:17',
      chipId: '00121317',
      name: 'Đèn ngủ',
      type: 'switch',
      state: 'off',
      connectStatus: 'online',
    },
  ]);

  const toggleSwitch = (id: string) => () => {
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

  useEffect(() => {
    const unsub = client.subscribeAckCommand(spaceId, (topic, msg) => {
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

    return () => {
      unsub();
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
              action={toggleSwitch(device.id)}
              key={device.id}
            />
          ))}
        </div>
      </div>
      <div className='h-20 bg-white'></div>
    </main>
  );
}
