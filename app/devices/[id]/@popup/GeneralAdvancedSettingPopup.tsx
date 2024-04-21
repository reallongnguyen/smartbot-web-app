import { IoTDevice } from '@/components/molecules/deviceCards/models';
import FullScreenDrawer from '@/components/templates/FullScreenDrawer';
import FullScreenDrawerContent from '@/components/templates/FullScreenDrawerContent';
import { Input } from 'antd';
import { ChangeEvent, useState } from 'react';

export interface GeneralAdvanceSettingPopupProps {
  open: boolean;
  device: IoTDevice;
  cancel: () => void;
  update: (data: Partial<IoTDevice>) => void;
}

const GeneralAdvanceSettingPopup = (props: GeneralAdvanceSettingPopupProps) => {
  const { open, device, cancel, update } = props;
  const [updateData, setUpdateData] = useState<Partial<IoTDevice>>(device);

  const save = () => {
    update(updateData);
  };

  const setName = (e: ChangeEvent<HTMLInputElement>) => {
    setUpdateData({
      ...updateData,
      name: e.target.value,
    });
  };

  return (
    <FullScreenDrawer open={open} onClose={cancel}>
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
        </div>
      </FullScreenDrawerContent>
    </FullScreenDrawer>
  );
};

export default GeneralAdvanceSettingPopup;
