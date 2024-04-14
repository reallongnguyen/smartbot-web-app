import { Button, Card } from 'antd';
import { Power } from 'lucide-react';
import SwitchIcon from '../../atoms/SwitchIcon';
import { memo } from 'react';
import ButtonIcon from '../../atoms/ButtonIcon';
import { IoTDevice } from './models';

export interface SwitchCardProps {
  device: IoTDevice;
  action?: () => void;
}

function SwitchCard(props: SwitchCardProps) {
  const { device, action } = props;

  const DeviceIcon =
    device.mode === 'switch' ? (
      <SwitchIcon state={device.state as 'on' | 'off'} />
    ) : (
      <ButtonIcon state={device.state as 'on' | 'off'} />
    );

  const state =
    device.mode === 'button' && device.state === 'on'
      ? 'release'
      : device.state;

  return (
    <Card className='h-28 relative' size='small'>
      <div className='flex justify-between'>
        {DeviceIcon}
        <Button
          className={`
            active:brightness-90
            ${
              device.state === 'on' && device.mode === 'switch'
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
      <div className='absolute left-0 bottom-0 w-full h-1/2 pt-1 px-3'>
        <div className='font-semibold truncate text-ellipsis'>
          {device.name}
        </div>
        <p className='text-xs'>{state.toUpperCase()}</p>
      </div>
    </Card>
  );
}

export default memo(SwitchCard);
