'use client';

import IoTDeviceCard from '@/components/molecules/deviceCards/IoTDeviceCard';
import { IoTDevice } from '@/components/molecules/deviceCards/models';
import { useAuthSession } from '@/usecases/auth/AuthContext';
import usePubSub from '@/usecases/pubsub/PubSubContext';
import { useSupabase } from '@/usecases/supabase/SupabaseContex';
import { useEffect, useState } from 'react';
import { camelCase, mapKeys } from 'lodash';
import { message } from 'antd';
import useCommandRepo from '@/usecases/iotDevice/useCommandRepo';

export default function Home() {
  const authSession = useAuthSession();
  const command = useCommandRepo();

  const pubsub = usePubSub();
  const supabase = useSupabase();

  const [devices, setDevices] = useState<Record<string, IoTDevice>>({});

  const handleCardAction = (device: IoTDevice) => () => {
    switch (device.type) {
      case 'bot_switch':
        if (device.switchBot?.mode === 'button') {
          command.turnOnSwitchBot(device.id);
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

    if (devices[id].switchBot?.state === 'on') {
      command.turnOffSwitchBot(id);
    } else {
      command.turnOnSwitchBot(id);
    }
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

      if (newDevices[id].type === 'bot_switch') {
        newDevices[id].switchBot = {
          ...newDevices[id].switchBot,
          ...data,
        };
      }

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
        .select('*, switch_bot:switch_bots!left(*), sensor:sensors!left(*)')
        .order('name', { nullsFirst: true });

      if (error) {
        console.error('home: getIoTDevices:', error);
        message.error({
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
  }, [supabase]);

  useEffect(() => {
    if (!pubsub || !authSession) {
      return;
    }

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

          if (newDevices[msg.iotDeviceId].type === 'bot_switch') {
            newDevices[msg.iotDeviceId].switchBot = {
              ...newDevices[msg.iotDeviceId].switchBot,
              state: msg.state,
            };
          }

          // make press animation if state of button change
          if (
            newDevices[msg.iotDeviceId].type === 'bot_switch' &&
            newDevices[msg.iotDeviceId].switchBot?.mode === 'button'
          ) {
            newDevices[msg.iotDeviceId].switchBot = {
              ...newDevices[msg.iotDeviceId].switchBot,
              state: 'press',
            };

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
      unsubDvUpdate();
      unsubMeasurement();
    };
  }, [authSession, pubsub]);

  return (
    <>
      <main className='relative h-[100dvh]'>
        <div className='h-8'></div>
        <header className='h-12 flex items-center px-6 sticky top-0 z-50 backdrop-blur-xl'>
          <h1 className='text-2xl font-semibold'>Home</h1>
        </header>
        <div className='px-6 pt-4 pb-24'>
          <div className='grid grid-cols-2 gap-5'>
            {Object.values(devices).map((device) => (
              <IoTDeviceCard
                device={device}
                action={handleCardAction(device)}
                key={device.id}
              />
            ))}
          </div>
        </div>
        <div className='fixed bottom-0 h-16 w-full backdrop-blur-xl'></div>
      </main>
    </>
  );
}
