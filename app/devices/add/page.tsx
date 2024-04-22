'use client';

import { useAuthSession } from '@/usecases/auth/AuthContext';
import { Button, Input, Result, Spin, message } from 'antd';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

function AddDevice() {
  const authSession = useAuthSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSetupWiFiDone, setIsSetupWiFiDone] = useState(false);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

  const [step, setStep] = useState(0);

  const router = useRouter();

  const nextStep = () => setStep(step + 1);

  const handleChangeSsid = (event: ChangeEvent<HTMLInputElement>) => {
    setSsid(event.target.value);
  };

  const handleChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const setupWiFiForDevice = async () => {
    try {
      setIsProcessing(true);
      setIsSetupWiFiDone(false);

      await axios.post(
        'http://192.168.4.1/config',
        {
          ssid,
          password,
          spaceId: authSession?.spaceId,
        },
        { timeout: 40000 }
      );

      message.success({ content: 'done' });
      setIsSetupWiFiDone(true);
    } catch (err) {
      message.error({ content: 'device can not connect to WiFi' });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let id: NodeJS.Timeout;

    const checkConnectDevice = async () => {
      try {
        setIsProcessing(true);
        await axios.get('http://192.168.4.1/ping', { timeout: 32000 });
        setIsProcessing(false);

        clearInterval(id);
      } catch (err) {}
    };

    checkConnectDevice();
    id = setInterval(checkConnectDevice, 32000);

    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <main className='relative h-[100dvh]'>
      <header className='h-12 px-2 w-full backdrop-blur-xl sticky top-0 z-50'>
        <div className='absolute top-1/2 -translate-y-1/2'>
          <div
            onClick={() => router.back()}
            className='flex items-center text-blue-500'
          >
            <ChevronLeft size={30} strokeWidth={1.5} />
            <div>Home</div>
          </div>
        </div>
        <div className='flex items-center justify-center h-full'>
          <h1 className='text-base font-bold'>New Device</h1>
        </div>
      </header>
      <div className='pt-4 px-6 space-y-8'>
        {step == 0 && (
          <>
            <div>
              <div className='text-2xl text-gray-600 rounded-xl mb-2'>
                Connect Device
              </div>
              <div className='bg-white p-4 rounded-xl space-y-2'>
                <p>
                  Scan QR code on the bottom of device to connect to
                  device&apos;s Direct WiFi.
                </p>
                <p>
                  If you can not see QR code or you scanning QR is unable, you
                  can connect WiFi manual. You should see a WiFi similar{' '}
                  <span className='text-blue-500'>
                    smartbot-[xx]-[yyyyyyyy]
                  </span>
                  .
                </p>
                <p>
                  After connect device&apos;s Direct WiFi, you will lost
                  internet in a while.
                </p>
              </div>
            </div>
            <div className='bg-white p-4 rounded-xl flex items-center justify-between'>
              <div className='flex items-center'>
                <Spin size='small' spinning={isProcessing} />
                {isProcessing ? (
                  <div className='ml-2'>Wait until the Next button active</div>
                ) : (
                  <div className='ml-2'>Connect device successfully</div>
                )}
              </div>
              <Button type='primary' disabled={isProcessing} onClick={nextStep}>
                Next
              </Button>
            </div>
          </>
        )}
        {step == 1 && (
          <>
            <div>
              <div className='text-2xl text-gray-600 rounded-xl mb-1'>
                Setting WiFi for Device
              </div>
              <p className='text-gray-500'>
                Connect IoT device with your WiFi. This device is only
                compatibility with WiFi 2.4G
              </p>
              <div className='bg-white p-4 rounded-xl space-y-3 mt-2'>
                <Input
                  autoFocus
                  variant='filled'
                  placeholder='WiFi SSID'
                  value={ssid}
                  onChange={handleChangeSsid}
                />
                <Input.Password
                  variant='filled'
                  placeholder='Password'
                  value={password}
                  onChange={handleChangePassword}
                />
                <Button
                  type='primary'
                  className='w-full !mt-8'
                  disabled={!ssid || !password || isProcessing}
                  onClick={setupWiFiForDevice}
                >
                  Setup
                </Button>
              </div>
            </div>
            <div className='bg-white p-4 rounded-xl flex items-center justify-between'>
              <div className='flex items-center'>
                <Spin size='small' spinning={isProcessing} />
                {!isSetupWiFiDone ? (
                  <div className='ml-2'>Wait until the Next button active</div>
                ) : (
                  <div className='ml-2'>Setup WiFi successfully</div>
                )}
              </div>
              <Button
                type='primary'
                disabled={!isSetupWiFiDone || isProcessing}
                onClick={nextStep}
              >
                Next
              </Button>
            </div>
          </>
        )}
        {step == 2 && (
          <>
            <div>
              <div className='text-2xl text-gray-600 rounded-xl mb-2'>
                Congratulations
              </div>
              <div className='bg-white p-4 rounded-xl'>
                <Result
                  status='success'
                  title='Great, we have done all the operations!'
                  subTitle='Let check the new device on Home page'
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default AddDevice;
