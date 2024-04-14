'use client';

import ButtonIcon from '@/components/atoms/ButtonIcon';
import GeneralDeviceIcon from '@/components/atoms/GeneralDeviceIcon';
import SwitchIcon from '@/components/atoms/SwitchIcon';
import { IoTDevice } from '@/components/molecules/IoTDevice/models';
import { useSupabase } from '@/usecases/supabase/SupabaseContex';
import { Button, Divider, Skeleton, message } from 'antd';
import { camelCase, mapKeys } from 'lodash';
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  Cpu,
  Edit,
  Info,
  ReceiptText,
  Settings,
  ThermometerSunIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function DevicePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [device, setDevice] = useState<IoTDevice | null>(null);

  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const getIoTDevice = async () => {
      let { data: iotDevice, error } = await supabase
        .from('iot_devices')
        .select('*, switch_bot:switch_bots!left(*), sensor:sensors!left(*)')
        .eq('id', id);

      console.log(id);

      if (error) {
        console.error('home: getIoTDevice:', error);
        message.open({
          type: 'error',
          content: error.message,
        });
        return;
      }

      console.log('getIoTDevice: device', iotDevice);
      if (!iotDevice || !iotDevice[0]) {
        return;
      }

      const camelDevice = mapKeys(iotDevice[0], (v, k) =>
        camelCase(k)
      ) as IoTDevice;

      ['switchBot', 'sensor'].forEach((extraData) => {
        if (camelDevice[extraData as 'switchBot' | 'sensor']) {
          camelDevice[extraData as 'switchBot' | 'sensor'] = mapKeys(
            camelDevice[extraData as 'switchBot' | 'sensor'],
            (v, k) => camelCase(k)
          );
        }
      });

      setDevice(camelDevice);
    };

    getIoTDevice();
  }, [id, supabase]);

  return (
    <main className='relative h-[100dvh]'>
      <header className='absolute top-0 h-12 px-3 w-full bg-white'>
        <div className='absolute top-1/2 -translate-y-1/2'>
          <Button
            onClick={() => router.back()}
            className='-ml-0.5'
            type='text'
            shape='circle'
          >
            <ArrowLeft size={28} />
          </Button>
        </div>
        <div className='flex items-center justify-center h-full'>
          <h1 className='text-lg font-semibold'>Bot Setting</h1>
        </div>
      </header>
      <div className='pt-12'>
        <div className='px-3 mt-3 bg-white'>
          {!device && <div className='h-64 grid place-items-center' />}
          {device && (
            <div className='h-64 grid grid-rows-[1fr_auto]'>
              <div className='grid place-items-center'>
                <div className='flex flex-col items-center'>
                  <div className='flex items-center justify-center w-28 h-20 rounded ring ring-teal-100'>
                    {device.switchBot && device.switchBot.mode === 'switch' && (
                      <SwitchIcon state={device.switchBot.state || 'off'} />
                    )}
                    {device.switchBot && device.switchBot.mode === 'button' && (
                      <ButtonIcon state={device.switchBot.state || 'off'} />
                    )}
                    {device.type === 'sensor_env' && (
                      <GeneralDeviceIcon
                        icon={
                          <ThermometerSunIcon
                            className='text-gray-50'
                            strokeWidth={1}
                          />
                        }
                        state={device.state || 'stopped'}
                      />
                    )}
                  </div>
                  <div className='flex items-center mt-2'>
                    <div className='mr-0.5'>{device?.name}</div>
                    <Button
                      type='text'
                      shape='circle'
                      icon={<Edit className='text-gray-400' size={18} />}
                    />
                  </div>
                </div>
              </div>
              <div className='py-1 flex space-x-2'>
                {device.switchBot?.mode === 'switch' && (
                  <>
                    <Button type='text' className='w-full'>
                      Switch On
                    </Button>
                    <Button type='text' className='w-full'>
                      Switch Off
                    </Button>
                  </>
                )}
                {device.switchBot?.mode === 'button' && (
                  <Button type='text' className='w-full'>
                    Press
                  </Button>
                )}
              </div>
            </div>
          )}
          <Divider orientationMargin={0} className='!m-0' />
          <div className='h-14 flex justify-between items-center'>
            <div className='flex items-center'>
              <Settings className='text-gray-400' />
              <div className='ml-3'>Advanced Settings</div>
            </div>
            <Button className='-mr-0.5' type='text' shape='circle'>
              <ChevronRight className='text-gray-400' />
            </Button>
          </div>
        </div>
        <div className='mt-3 bg-white'>
          <div className='mx-3'>
            <div className='h-14 flex justify-between items-center'>
              <div className='flex items-center'>
                <CalendarClock className='text-gray-400' />
                <div className='ml-3'>Schedule</div>
              </div>
              <Button className='-mr-0.5' type='text' shape='circle'>
                <ChevronRight className='text-gray-400' />
              </Button>
            </div>
            <Divider orientationMargin={0} className='!m-0' />
            <div className='h-14 flex justify-between items-center'>
              <div className='flex items-center'>
                <ReceiptText className='text-gray-400' />
                <div className='ml-3'>Log</div>
              </div>
              <Button className='-mr-0.5' type='text' shape='circle'>
                <ChevronRight className='text-gray-400' />
              </Button>
            </div>
            <Divider orientationMargin={0} className='!m-0' />
            <div className='h-14 flex justify-between items-center'>
              <div className='flex items-center'>
                <Cpu className='text-gray-400' />
                <div className='ml-3'>Firmware</div>
              </div>
              <Button className='-mr-0.5' type='text' shape='circle'>
                <ChevronRight className='text-gray-400' />
              </Button>
            </div>
            <Divider orientationMargin={0} className='!m-0' />
            <div className='h-14 flex justify-between items-center'>
              <div className='flex items-center'>
                <Info className='text-gray-400' />
                <div className='ml-3'>Device info</div>
              </div>
              <Button className='-mr-0.5' type='text' shape='circle'>
                <ChevronRight className='text-gray-400' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default DevicePage;
