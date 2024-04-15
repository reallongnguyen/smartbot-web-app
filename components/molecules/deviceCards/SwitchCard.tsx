import { Button, Card } from 'antd';
import { Power } from 'lucide-react';
import SwitchIcon from '../../atoms/SwitchIcon';
import { memo } from 'react';
import ButtonIcon from '../../atoms/ButtonIcon';
import { IoTDevice, SwitchBotData } from './models';
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
      <SwitchIcon state={(device.switchBot?.state || 'off') as 'on' | 'off'} />
    ) : (
      <ButtonIcon state={device.switchBot?.state || 'off'} />
    );

  const state =
    device.switchBot?.mode === 'button' && device.switchBot?.state === 'on'
      ? 'release'
      : device.switchBot?.state || 'off';

  return (
    <Card className='h-28 relative' size='small'>
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
      <div className='absolute left-0 bottom-0 w-full h-1/2 pt-1 px-3 pointer-events-none'>
        <div className='font-semibold truncate text-ellipsis'>
          {device.name || 'no name'}
        </div>
        <p className='text-xs'>{state.toUpperCase()}</p>
      </div>
    </Card>
  );
}

export default memo(SwitchCard);
