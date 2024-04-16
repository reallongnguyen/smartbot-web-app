import {
  IoTDevice,
  SwitchBotData,
  SwitchMode,
} from '@/components/molecules/deviceCards/models';
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
    <div className='bg-gray-50 h-full'>
      <div className='relative flex items-center justify-center w-full h-12 mb-4'>
        <div className='font-semibold text-base'>Advanced settings</div>
        <div className='absolute left-2'>
          <Button
            type='text'
            onClick={cancel}
            style={{ color: 'rgb(59 130 246)' }}
          >
            Cancel
          </Button>
        </div>
        <div className='absolute right-2'>
          <Button
            type='text'
            onClick={save}
            style={{ color: 'rgb(59 130 246)' }}
          >
            Apply
          </Button>
        </div>
      </div>
      <div className='space-y-8'>
        <div className='mx-6 p-4 bg-white rounded-xl space-y-2'>
          <div>
            <div className='mb-1'>Device name</div>
            <Input
              size='large'
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
    </div>
  );
};

export default SwitchBotAdvanceSetting;
