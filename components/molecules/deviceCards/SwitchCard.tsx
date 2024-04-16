import { Button, Card } from 'antd';
import { Power } from 'lucide-react';
import SwitchIcon from '../../atoms/SwitchIcon';
import { memo } from 'react';
import ButtonIcon from '../../atoms/ButtonIcon';
import { IoTDevice, SwitchBotData, SwitchState } from './models';
import { useRouter } from 'next/navigation';

export interface SwitchCardProps {
  device: IoTDevice<SwitchBotData>;
  action?: () => void;
}

function SwitchCard(props: SwitchCardProps) {
  const { device, action } = props;

  const router = useRouter();

  const DeviceIcon =
    device.switchBot?.mode === 'switch' ? (
      <SwitchIcon state={(device.switchBot?.state || 'off') as SwitchState} />
    ) : (
      <ButtonIcon state={device.switchBot?.state || 'off'} />
    );

  const state =
    device.switchBot?.mode === 'button' && device.switchBot?.state === 'on'
      ? 'release'
      : device.switchBot?.state || 'off';

  return (
    <div className='aspect-square relative bg-white p-4 rounded-3xl ring-1 ring-gray-100 overflow-hidden'>
      <div
        className='absolute left-0 top-0 w-full h-full'
        onClick={() => router.push(`/devices/${device.id}`)}
      />
      <div className='flex justify-between'>
        {DeviceIcon}
        <Button
          className={`
            active:brightness-90
            ${
              device.switchBot?.state === 'on' &&
              device.switchBot?.mode === 'switch'
                ? '!bg-amber-200/70 ring ring-amber-50'
                : '!bg-gray-200'
            }
          `}
          shape='circle'
          type='text'
          size='large'
          icon={<Power size='18px' className='text-gray-700/70' />}
          onClick={action}
        />
      </div>
      <div className='absolute left-0 bottom-4 w-full pt-1 px-4 pointer-events-none'>
        <div className='text-lg font-semibold truncate text-ellipsis'>
          {device.name || 'no name'}
        </div>
        <p className='text-sm mt-0.5'>{state.toUpperCase()}</p>
      </div>
    </div>
  );
}

export default memo(SwitchCard);
