'use client';

import {
  IoTDevice,
  SensorData,
  SwitchBotData,
} from '@/components/molecules/deviceCards/models';
import EnvSensorDetail from '@/components/organisms/deviceDetails/EnvSensor';
import SwitchBotDetail from '@/components/organisms/deviceDetails/SwitchBotDetail';
import { useAuthSession } from '@/usecases/auth/AuthContext';
import useCommand from '@/usecases/command/useCommand';
import usePubSub from '@/usecases/pubsub/PubSubContext';
import { useSupabase } from '@/usecases/supabase/SupabaseContex';
import { Button, Divider, Drawer, Input, message } from 'antd';
import { camelCase, mapKeys } from 'lodash';
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  Cpu,
  Info,
  ReceiptText,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

function DevicePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const authSession = useAuthSession();

  const [device, setDevice] = useState<IoTDevice | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [drawer, setDrawer] = useState('');

  const router = useRouter();
  const pubsub = usePubSub();
  const supabase = useSupabase();
  const command = useCommand();

  const changeDevice = (id: string, data: Record<string, any>) => {
    setDevice((d) => {
      if (!d || d.id !== id) {
        return d;
      }

      const newDevice = {
        ...d,
        ...data,
      };

      if (newDevice.type === 'bot_switch') {
        newDevice.switchBot = {
          ...newDevice.switchBot,
          ...data,
        };
      }

      return newDevice;
    });
  };

  const openAdvancedSetting = () => {
    setDrawer('advancedSetting');
  };

  const closeDrawer = () => {
    setDrawer('');
  };

  const updateSwitchBot = useCallback(async () => {
    if (!supabase || !device) {
      return;
    }

    const { error } = await supabase
      .from('iot_devices')
      .update({ name: deviceName })
      .eq('id', device.id);

    if (error) {
      message.error({ content: error.message });
      return;
    }

    message.success({ content: 'saved' });
    setDevice((d) => (d ? { ...d, name: deviceName } : d));
    closeDrawer();
  }, [device, deviceName, supabase]);

  useEffect(() => {
    setDeviceName(device?.name || '');
  }, [device?.name]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const getIoTDevice = async (id: string) => {
      let { data: iotDevice, error } = await supabase
        .from('iot_devices')
        .select('*, switch_bot:switch_bots!left(*), sensor:sensors!left(*)')
        .eq('id', id);

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

    getIoTDevice(id);
  }, [id, supabase]);

  useEffect(() => {
    if (!pubsub || !authSession) {
      return;
    }

    const unsubDvUpdate = pubsub.subscribeDeviceUpdate(
      authSession.spaceId,
      (topic, msg) => {
        setDevice((d) => {
          if (!d || d.id !== msg.iotDeviceId) {
            return d;
          }

          const newDevice = {
            ...d,
            state: msg.state,
          };

          if (newDevice.type === 'bot_switch') {
            newDevice.switchBot = {
              ...newDevice.switchBot,
              state: msg.state,
            };
          }

          // make press animation if state of button change
          if (
            newDevice.type === 'bot_switch' &&
            newDevice.switchBot?.mode === 'button'
          ) {
            if (typeof newDevice.switchBot !== 'undefined') {
              (newDevice.switchBot as any).state = 'press';
            }

            setTimeout(
              () => changeDevice(msg.iotDeviceId, { state: msg.state }),
              500
            );
          }

          return newDevice;
        });
      }
    );

    return () => {
      unsubDvUpdate;
    };
  }, [authSession, pubsub]);

  return (
    <>
      <Drawer
        placement='bottom'
        open={drawer === 'advancedSetting'}
        onClose={closeDrawer}
        height='94dvh'
        title={
          <div className='flex items-center justify-between h-10'>
            <div className=''>Advanced settings</div>
            <div className=''>
              <Button type='primary' onClick={updateSwitchBot}>
                Apply
              </Button>
            </div>
          </div>
        }
        styles={{
          body: { padding: 0 },
          header: {
            padding: '0 0.75rem 0 0.75rem',
          },
        }}
      >
        <div className='px-3 pt-3 pb-8'>
          <div className='mb-1 font-semibold'>Device name</div>
          <Input
            size='large'
            allowClear
            autoFocus
            value={deviceName}
            placeholder='Device name'
            onChange={(e) => setDeviceName(e.target.value)}
          />
        </div>
      </Drawer>
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
            <h1 className='text-lg'>Bot Setting</h1>
          </div>
        </header>
        <div className='pt-12'>
          <div className='px-3 mt-3 bg-white'>
            <div className='h-64 grid grid-rows-[1fr_auto]'>
              {device?.type === 'bot_switch' && (
                <SwitchBotDetail
                  device={device as IoTDevice<SwitchBotData>}
                  turnOn={() => command.turnOnSwitchBot(id)}
                  turnOff={() => command.turnOffSwitchBot(id)}
                  changeName={openAdvancedSetting}
                />
              )}

              {device?.type === 'sensor_env' && (
                <EnvSensorDetail
                  device={device as IoTDevice<SensorData>}
                  changeName={openAdvancedSetting}
                />
              )}
            </div>

            <Divider orientationMargin={0} className='!m-0' />
            <div
              className='h-14 flex justify-between items-center'
              onClick={openAdvancedSetting}
            >
              <div className='flex items-center'>
                <Settings className='text-gray-600' />
                <div className='ml-3'>Advanced Settings</div>
              </div>
              <Button className='-mr-0.5' type='text' shape='circle'>
                <ChevronRight className='text-gray-600' />
              </Button>
            </div>
          </div>
          <div className='mt-3 bg-white'>
            <div className='mx-3'>
              <div className='h-14 flex justify-between items-center'>
                <div className='flex items-center'>
                  <CalendarClock className='text-gray-600' />
                  <div className='ml-3'>Schedule</div>
                </div>
                <Button className='-mr-0.5' type='text' shape='circle'>
                  <ChevronRight className='text-gray-600' />
                </Button>
              </div>
              <Divider orientationMargin={0} className='!m-0' />
              <div className='h-14 flex justify-between items-center'>
                <div className='flex items-center'>
                  <ReceiptText className='text-gray-600' />
                  <div className='ml-3'>Log</div>
                </div>
                <Button className='-mr-0.5' type='text' shape='circle'>
                  <ChevronRight className='text-gray-600' />
                </Button>
              </div>
              <Divider orientationMargin={0} className='!m-0' />
              <div className='h-14 flex justify-between items-center'>
                <div className='flex items-center'>
                  <Cpu className='text-gray-600' />
                  <div className='ml-3'>Firmware</div>
                </div>
                <Button className='-mr-0.5' type='text' shape='circle'>
                  <ChevronRight className='text-gray-600' />
                </Button>
              </div>
              <Divider orientationMargin={0} className='!m-0' />
              <div className='h-14 flex justify-between items-center'>
                <div className='flex items-center'>
                  <Info className='text-gray-600' />
                  <div className='ml-3'>Device info</div>
                </div>
                <Button className='-mr-0.5' type='text' shape='circle'>
                  <ChevronRight className='text-gray-600' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default DevicePage;
