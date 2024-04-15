import { memo } from 'react';
import { IoTDevice, SensorData, SwitchBotData } from './models';
import SwitchCard from './SwitchCard';
import ClimaTrackCard from './ClimaTrackCard';

export interface IoTDeviceCardProps {
  device: IoTDevice;
  action?: () => void;
}

function IoTDeviceCard(props: IoTDeviceCardProps) {
  const { device } = props;

  if (device.type === 'bot_switch') {
    return (
      <SwitchCard {...props} device={device as IoTDevice<SwitchBotData>} />
    );
  }

  if (device.type === 'sensor_env') {
    return (
      <ClimaTrackCard {...props} device={device as IoTDevice<SensorData>} />
    );
  }

  return <></>;
}

export default memo(IoTDeviceCard);
