import {
  IoTDevice,
  SwitchBotData,
  SwitchMode,
} from '@/components/molecules/deviceCards/models';
import FullScreenDrawerContent from '@/components/templates/FullScreenDrawerContent';
import { Button, Input } from 'antd';
import { ChangeEvent, useState } from 'react';

export interface SwitchBotAdvanceSettingProps {
  device: IoTDevice<SwitchBotData>;
  cancel: () => void;
  updateSwitchBot: (data: Partial<IoTDevice<SwitchBotData>>) => void;
}

const SwitchBotAdvanceSetting = (props: SwitchBotAdvanceSettingProps) => {
  const { device, cancel, updateSwitchBot } = props;
  const [updateData, setUpdateData] =
    useState<Partial<IoTDevice<SwitchBotData>>>(device);

  const mode = updateData.switchBot?.mode;

  const save = () => {
    updateSwitchBot(updateData);
  };

  const setName = (e: ChangeEvent<HTMLInputElement>) => {
    setUpdateData({
      ...updateData,
      name: e.target.value,
    });
  };

  const setMode = (mode: SwitchMode) => {
    setUpdateData({
      ...updateData,
      switchBot: {
        ...updateData.switchBot!,
        mode,
      },
    });
  };

  return (
    <FullScreenDrawerContent
      ok={save}
      cancel={cancel}
      title='Advanced Settings'
    >
      <div className='space-y-8'>
        <div>
          <div className='mx-6 mb-1 text-gray-400 text-base'>Device name</div>
          <div className='mx-6 p-4 bg-white rounded-xl space-y-2'>
            <Input
              size='large'
              variant='filled'
              allowClear
              autoFocus
              value={updateData.name}
              placeholder='Device name'
              onChange={setName}
            />
          </div>
        </div>
        <div className='mx-6 p-4 bg-white rounded-xl space-y-2'>
          <div className='flex justify-between items-center'>
            <div className='mb-1'>Device mode</div>
            <div className=''>
              <Button.Group>
                <Button
                  type={mode === 'switch' ? 'primary' : 'default'}
                  onClick={() => setMode('switch')}
                >
                  Switch
                </Button>
                <Button
                  type={mode === 'button' ? 'primary' : 'default'}
                  onClick={() => setMode('button')}
                >
                  Button
                </Button>
              </Button.Group>
            </div>
          </div>
        </div>
      </div>
    </FullScreenDrawerContent>
  );
};

export default SwitchBotAdvanceSetting;
