import GeneralDeviceIcon from '@/components/atoms/GeneralDeviceIcon';
import {
  IoTDevice,
  SensorData,
} from '@/components/molecules/deviceCards/models';
import { Button } from 'antd';
import { Edit, ThermometerSunIcon } from 'lucide-react';

export interface EnvSensorDetailProps {
  device: IoTDevice<SensorData>;
  changeName: () => void;
}

const EnvSensorDetail = (props: EnvSensorDetailProps) => {
  const { device, changeName } = props;

  return (
    <>
      <div className='grid place-items-center'>
        <div className='flex flex-col items-center'>
          <div className='flex items-center justify-center w-28 h-20 rounded ring ring-teal-100'>
            <GeneralDeviceIcon
              icon={
                <ThermometerSunIcon className='text-gray-50' strokeWidth={1} />
              }
              state={device.state || 'stopped'}
            />
          </div>
          <div className='flex items-center mt-2'>
            <div className='mr-0.5 text-lg'>{device.name || 'no name'}</div>
            <Button
              type='text'
              shape='circle'
              icon={<Edit className='text-gray-600' size={18} />}
              onClick={changeName}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EnvSensorDetail;
