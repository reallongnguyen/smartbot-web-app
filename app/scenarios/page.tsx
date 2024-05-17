'use client';

import ButtonIcon from '@/components/atoms/ButtonIcon';
import GeneralDeviceIcon from '@/components/atoms/GeneralDeviceIcon';
import SwitchIcon from '@/components/atoms/SwitchIcon';
import {
  IoTDevice,
  SwitchState,
} from '@/components/molecules/deviceCards/models';
import usePubSub from '@/usecases/pubsub/PubSubContext';
import { useSupabase } from '@/usecases/supabase/SupabaseContex';
import { message } from 'antd';
import { camelCase, mapKeys } from 'lodash';
import {
  HomeIcon,
  MapIcon,
  SquarePlus,
  ThermometerSunIcon,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const triggerDeviceId = '01HVAJ1N63VW5BAA6SDDWNB88Q';
const triggerType = 'sensor_data';
const triggerSensorType = 'light';
const threshold = 4;
const targetDeviceId = '01HTQ9844VMWWP70AD8HGJ48BY';
const spaceId = '01HTQ9HBANAVTXG95AQWSWGXKK';
const action = 'on';

export interface PageProps {}

function Page(props: PageProps) {
  const pubsub = usePubSub();
  const supabase = useSupabase();

  const [devices, setDevices] = useState<Record<string, IoTDevice>>({});

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

  return (
    <>
      <main className='relative h-[100dvh]'>
        <div className='h-8'></div>
        <header className='h-12 flex items-center px-6 sticky top-0 z-50 backdrop-blur-xl'>
          <h1 className='text-2xl font-semibold'>Scenario</h1>
        </header>
        <div className='mx-6 mt-8 text-2xl mb-2'>If</div>
        <div className='mx-6 p-4 rounded-xl bg-white'>
          <div className='text-base text-gray-400 mb-4'>Trigger device</div>
          <div className='flex space-x-4 items-center'>
            <div className='w-8'>
              <GeneralDeviceIcon
                icon={
                  <ThermometerSunIcon
                    className='text-gray-50'
                    strokeWidth={1}
                  />
                }
                state={'running'}
              />
            </div>
            <div className='text-xl'>{devices[triggerDeviceId]?.name}</div>
          </div>
          <div className='text-base text-gray-400 mt-6 mb-2'>Condition</div>
          <div className='flex space-x-2'>
            <div className='font-semibold text-lg'>light value</div>
            <div className='text-gray-400 text-lg'>is less than</div>
            <div className='font-semibold text-lg'>4</div>
          </div>
        </div>
        <div className='mx-6 mt-8 text-2xl mb-2'>Then</div>
        <div className='mx-6 p-4 rounded-xl bg-white'>
          <div className='text-base text-gray-400 mb-4'>Target device</div>
          <div className='flex space-x-4 items-center'>
            <div className='w-8'>
              {devices[targetDeviceId]?.switchBot?.mode === 'switch' ? (
                <SwitchIcon
                  state={
                    (devices[targetDeviceId]?.switchBot?.state ||
                      'off') as SwitchState
                  }
                />
              ) : (
                <ButtonIcon
                  state={devices[targetDeviceId]?.switchBot?.state || 'off'}
                />
              )}
            </div>
            <div className='text-xl'>{devices[targetDeviceId]?.name}</div>
          </div>
          <div className='text-base text-gray-400 mt-6 mb-2'>Action</div>
          <div className='flex space-x-2'>
            {devices[targetDeviceId]?.switchBot?.mode === 'switch' && (
              <div className='font-semibold text-lg'>
                {action === 'on' ? 'Turn On' : 'Turn Off'}
              </div>
            )}
            {devices[targetDeviceId]?.switchBot?.mode === 'button' && (
              <div className='font-semibold text-lg'>Press</div>
            )}
          </div>
        </div>
        <div className='fixed bottom-0 h-16 w-full backdrop-blur-xl flex justify-evenly'>
          <Link href='/'>
            <div className='relative h-16 w-16 grid place-items-center text-gray-600 hover:active:bg-green-50'>
              <HomeIcon className='-translate-y-2' size={26} />
              <div className='absolute text-[11px] bottom-2'>Home</div>
            </div>
          </Link>
          <Link href='/devices/add'>
            <div className='relative h-16 w-16 grid place-items-center text-gray-600 hover:active:bg-green-50'>
              <SquarePlus className='-translate-y-2' size={26} />
              <div className='absolute text-[11px] bottom-2'>Add Device</div>
            </div>
          </Link>
          <Link href='/scenarios'>
            <div className='relative h-16 w-16 grid place-items-center text-gray-600 hover:active:bg-green-50'>
              <MapIcon className='-translate-y-2' size={26} />
              <div className='absolute text-[11px] bottom-2'>Scenario</div>
            </div>
          </Link>
          <Link href='/profiles'>
            <div className='relative h-16 w-16 grid place-items-center text-gray-600 hover:active:bg-green-50'>
              <User className='-translate-y-2' size={26} />
              <div className='absolute text-[11px] bottom-2'>Profile</div>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}

export default Page;
