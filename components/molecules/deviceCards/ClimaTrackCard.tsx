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

  const expandFirst =
    device.sensor?.measurements && device.sensor?.measurements.length % 2 === 1;

  useEffect(() => {
    const itvId = setInterval(() => {
      setReltTime(dayjs(device.sensor?.lastMeasurementAt).fromNow());
    }, 1000);

    return () => {
      clearInterval(itvId);
    };
  });

  return (
    <div className='aspect-square relative bg-white p-4 rounded-3xl ring-1 ring-gray-100 overflow-hidden'>
      <div
        className='absolute left-0 top-0 w-full h-full'
        onClick={() => router.push(`/devices/${device.id}`)}
      />
      <div className='flex justify-between'>
        <GeneralDeviceIcon
          icon={<ThermometerSunIcon className='text-gray-50' strokeWidth={1} />}
          state={device.state as 'running' | 'stopped'}
        />
        <div className='grid gap-1 grid-cols-2 grid-rows-2 w-20 h-20'>
          {device.sensor?.measurements.map((item, idx) => (
            <div
              className={`
                text-sm rounded w-full overflow-hidden p-1
                ${expandFirst && idx === 0 ? 'col-span-2' : ''}
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
              <div className='text-[8px] text-gray-600 -mt-1'>
                {mapMeasurementValue[item.type as any].shortTitle}
              </div>
              <div className='-mt-0.5 text-xs'>
                {mapMeasurementValue[item.type as any].getData(item.value)}
                <span className='ml-0.5 text-[10px]'>
                  {mapMeasurementValue[item.type as any].suffix}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='absolute left-0 bottom-4 w-full pt-1 px-4 pointer-events-none'>
        <div className='text-lg font-semibold truncate text-ellipsis'>
          {device.name || 'no name'}
        </div>
        <div className='flex space-x-1 items-center'>
          <p className='text-sm'>{shortState.toUpperCase()}</p>
          {device.sensor?.lastMeasurementAt && (
            <>
              <Divider type='vertical' className='mx-1' />
              <div className='text-sm'>{reltTime}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClimaTrackCard;
