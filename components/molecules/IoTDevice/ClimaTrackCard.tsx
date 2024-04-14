import { Card, Divider } from 'antd';
import { ThermometerSunIcon } from 'lucide-react';
import { IoTDevice, SensorData, mapMeasurementValue } from './models';
import GeneralDeviceIcon from '@/components/atoms/GeneralDeviceIcon';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

dayjs.extend(relativeTime);

export interface ClimaTrackCardProps {
  device: IoTDevice<SensorData>;
  action?: () => void;
}

function ClimaTrackCard(props: ClimaTrackCardProps) {
  const { device } = props;

  const router = useRouter();

  const [reltTime, setReltTime] = useState(
    dayjs(device.sensor?.lastMeasurementAt).fromNow()
  );

  const shortState = device.state === 'running' ? 'run' : 'stop';

  useEffect(() => {
    const itvId = setInterval(() => {
      setReltTime(dayjs(device.sensor?.lastMeasurementAt).fromNow());
    }, 1000);

    return () => {
      clearInterval(itvId);
    };
  });

  return (
    <Card className='h-28 relative' size='small'>
      <div
        className='absolute left-0 top-0 w-full h-full'
        onClick={() => router.push(`/devices/${device.id}`)}
      />
      <div className='flex justify-between'>
        <GeneralDeviceIcon
          icon={<ThermometerSunIcon className='text-gray-50' strokeWidth={1} />}
          state={device.state as 'running' | 'stopped'}
        />
        <div className='w-6' />
        <div className='grid gap-0.5 grid-cols-3 w-full'>
          {device.sensor?.measurements.map((item) => (
            <div
              className={`
                text-sm rounded-sm w-full overflow-hidden
                ${
                  mapMeasurementValue[item.type as any].bgColor === 'sky'
                    ? 'bg-sky-50'
                    : ''
                }
                ${
                  mapMeasurementValue[item.type as any].bgColor === 'amber'
                    ? 'bg-amber-50'
                    : ''
                }
                ${
                  mapMeasurementValue[item.type as any].bgColor === 'rose'
                    ? 'bg-rose-50'
                    : ''
                }
              `}
              key={item.type}
            >
              <div className='text-[8px] text-gray-600 mx-0.5'>
                {mapMeasurementValue[item.type as any].shortTitle}
              </div>
              <div className='-mt-0.5 text-xs mx-0.5'>
                {mapMeasurementValue[item.type as any].getData(item.value)}
                <span className='ml-0.5 text-[8px]'>
                  {mapMeasurementValue[item.type as any].suffix}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='absolute left-0 bottom-0 w-full h-1/2 pt-1 px-3 pointer-events-none'>
        <div className='font-semibold truncate text-ellipsis'>
          {device.name}
        </div>
        <div className='flex space-x-1 items-center'>
          <p className='text-xs'>{shortState.toUpperCase()}</p>
          {device.sensor?.lastMeasurementAt && (
            <>
              <Divider type='vertical' className='mx-1' />
              <div className='text-xs'>{reltTime}</div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ClimaTrackCard;
