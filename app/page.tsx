'use client';

import IoTDeviceCard from '@/components/molecules/IoTDevice/IoTDeviceCard';
import { IoTDevice } from '@/components/molecules/IoTDevice/models';
import { useAuthSession } from '@/usecases/auth/AuthContext';
import usePubSub from '@/usecases/pubsub/PubSubContext';
import { useSupabase } from '@/usecases/supabase/SupabaseContex';
import { useEffect, useState } from 'react';
import { ulid } from 'ulid';
import { camelCase, mapKeys } from 'lodash';
import { message } from 'antd';

export default function Home() {
  const authSession = useAuthSession();
  const spaceId = authSession?.spaceId || '';
  const userId = authSession?.userId || '';

  const pubsub = usePubSub();
  const supabase = useSupabase();

  const [devices, setDevices] = useState<Record<string, IoTDevice>>({});

  const [messageApi, messageContext] = message.useMessage();

  const handleCardAction = (device: IoTDevice) => () => {
    switch (device.type) {
      case 'bot_switch':
        if (device.switchBot?.mode === 'button') {
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

    pubsub?.publishCommand(spaceId, id, {
      id: ulid(),
      requesterId: userId,
      command: devices[id].switchBot?.state === 'on' ? 'off' : 'on',
      type: 'functional',
    });
  };

  const pressButton = (id: string) => {
    if (!devices[id]) {
      return;
    }

    pubsub?.publishCommand(spaceId, id, {
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
    if (!supabase) {
      return;
    }

    const getIoTDevices = async () => {
      let { data: iotDevices, error } = await supabase
        .from('iot_devices')
        .select('*, switch_bot:switch_bots!left(*), sensor:sensors!left(*)');

      if (error) {
        console.error('home: getIoTDevices:', error);
        messageApi.open({
          type: 'error',
          content: error.message,
        });
        return;
      }

      console.log('getIoTDevices: iotDevices', iotDevices);
      const store: Record<string, IoTDevice> = {};
      if (iotDevices) {
        iotDevices.forEach((device) => {
          const camelDevice = mapKeys(device, (v, k) => camelCase(k));

          ['switchBot', 'sensor'].forEach((extraData) => {
            if (camelDevice[extraData]) {
              camelDevice[extraData] = mapKeys(camelDevice[extraData], (v, k) =>
                camelCase(k)
              );
            }
          });

          store[camelDevice.id] = camelDevice as IoTDevice;
        });
      }

      setDevices(store);
    };

    getIoTDevices();
  }, [messageApi, supabase]);

  useEffect(() => {
    if (!pubsub || !authSession) {
      return;
    }

    const unsubAckCmd = pubsub.subscribeAck(
      authSession.spaceId,
      authSession.userId,
      (topic, msg) => {
        changeDevice(msg.iotDeviceId, { state: msg.newState });
      }
    );

    const unsubDvUpdate = pubsub.subscribeDeviceUpdate(
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

          if (newDevices[msg.iotDeviceId].type === 'switch') {
            newDevices[msg.iotDeviceId].switchBot = {
              ...newDevices[msg.iotDeviceId].switchBot,
              state: msg.state,
            };
          }

          // make press animation if state of button change
          if (
            newDevices[msg.iotDeviceId].type === 'switch' &&
            newDevices[msg.iotDeviceId].switchBot?.mode === 'button' &&
            dvs[msg.iotDeviceId].switchBot?.state !== msg.state
          ) {
            if (typeof newDevices[msg.iotDeviceId].switchBot !== 'undefined') {
              (newDevices[msg.iotDeviceId].switchBot as any).state = 'press';
            }

            setTimeout(
              () => changeDevice(msg.iotDeviceId, { state: msg.state }),
              500
            );
          }

          return newDevices;
        });
      }
    );

    const unsubMeasurement = pubsub.subscribeMeasurement(
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
              sensor: {
                ...dvs[id].sensor,
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
  }, [authSession, pubsub]);

  return (
    <>
      {messageContext}
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
        <div className='absolute bottom-0 h-16 w-full bg-white'></div>
      </main>
    </>
  );
}
