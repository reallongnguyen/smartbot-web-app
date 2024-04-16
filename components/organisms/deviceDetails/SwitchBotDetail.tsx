import ButtonIcon from '@/components/atoms/ButtonIcon';
import SwitchIcon from '@/components/atoms/SwitchIcon';
import {
  IoTDevice,
  SwitchBotData,
} from '@/components/molecules/deviceCards/models';
import { Button } from 'antd';
import { Edit } from 'lucide-react';

export interface SwitchBotDetailProps {
  device: IoTDevice<SwitchBotData>;
  turnOn: () => void;
  turnOff: () => void;
  changeName: () => void;
}

const SwitchBotDetail = (props: SwitchBotDetailProps) => {
  const { device, turnOn, turnOff, changeName } = props;

  return (
    <>
      <div className='grid place-items-center'>
        <div className='flex flex-col items-center'>
          <div className='flex items-center justify-center w-28 h-20 rounded ring ring-teal-100'>
            {device.switchBot && device.switchBot.mode === 'switch' && (
              <SwitchIcon state={device.switchBot.state || 'off'} />
            )}
            {device.switchBot && device.switchBot.mode === 'button' && (
              <ButtonIcon state={device.switchBot.state || 'off'} />
            )}
          </div>
          <div className='flex items-center mt-2'>
            <div className='mr-0.5 text-lg'>{device?.name || 'no name'}</div>
            <Button
              type='text'
              shape='circle'
              icon={<Edit className='text-gray-600' size={18} />}
              onClick={changeName}
            />
          </div>
        </div>
      </div>
      <div className='py-1 flex space-x-2'>
        {device.switchBot?.mode === 'switch' && (
          <>
            <Button type='text' className='w-full' onClick={turnOn}>
              Switch On
            </Button>
            <Button type='text' className='w-full' onClick={turnOff}>
              Switch Off
            </Button>
          </>
        )}
        {device.switchBot?.mode === 'button' && (
          <Button type='text' className='w-full' onClick={turnOn}>
            Press
          </Button>
        )}
      </div>
    </>
  );
};

export default SwitchBotDetail;
