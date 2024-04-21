import FullScreenDrawer from '@/components/templates/FullScreenDrawer';
import FullScreenDrawerContent from '@/components/templates/FullScreenDrawerContent';
import { Button, Divider, Empty, Tag, message } from 'antd';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import crontrue from 'cronstrue';
import { IoTDevice } from '@/components/molecules/deviceCards/models';
import useScheduleRepo from '@/usecases/schedule/useScheduleRepo';
import { Schedule } from '@/usecases/schedule/model';
import { PlusCircle, Trash2 } from 'lucide-react';
import AddSchedulePopup from './AddSchedulePopup';
import { mapDeviceTypeActionOptions } from '@/usecases/common/deviceModel';
import { ulid } from 'ulid';

export interface ListSchedulePopupProps {
  open: boolean;
  close: () => void;
  device: IoTDevice;
}

const ListSchedulePopup = (
  props: PropsWithChildren<ListSchedulePopupProps>
) => {
  const { open, close, device } = props;
  const [schedules, setSchedules] = useState<Record<string, Schedule>>({});
  const [openAddSchedule, setOpenAddSchedule] = useState(false);

  const scheduleRepo = useScheduleRepo();

  const mapActionName: Record<string, string> = (
    mapDeviceTypeActionOptions[device.type] || []
  ).reduce((p, c) => ({ ...p, [c.action]: c.name }), {});

  const humanSchedules = useMemo(() => {
    const mapScheduleHumanText: Record<string, string> = {};

    Object.values(schedules).forEach((s) => {
      try {
        mapScheduleHumanText[s.id] = crontrue.toString(s.schedule);
      } catch (err) {
        mapScheduleHumanText[s.id] = 'Invalid schedule';
      }
    });

    return mapScheduleHumanText;
  }, [schedules]);

  const addSchedule = useCallback(
    async (schedule: string, isRepeat: boolean, action: string) => {
      const { data, error } = await scheduleRepo.addOneSchedule({
        id: ulid(),
        deviceId: device.id,
        schedule,
        isRepeat,
        action,
      });

      if (error) {
        message.error({ content: error.message });

        return;
      }

      message.success({ content: 'saved' });
      setSchedules((v) => ({ ...v, [data.id]: data }));
      setOpenAddSchedule(false);
    },
    [device.id, scheduleRepo]
  );

  const deleteSchedule = async (id: string) => {
    const { error } = await scheduleRepo.deleteSchedules([id]);

    if (error) {
      message.error({ content: error.message });
      return;
    }

    message.success({ content: 'deleted' });

    const newSchedules = { ...schedules };
    delete newSchedules[id];
    setSchedules(newSchedules);
  };

  useEffect(() => {
    const findSchedules = async () => {
      const { data, error } = await scheduleRepo.getSchedulesByDeviceId(
        device.id
      );

      if (error) {
        message.error({ content: error.message });
        return;
      }

      const mapSchedule = data.reduce(
        (p, c) => ({
          ...p,
          [c.id]: c,
        }),
        {}
      );

      setSchedules(mapSchedule);
    };

    findSchedules();
  }, [device.id, scheduleRepo, setSchedules]);

  return (
    <>
      <AddSchedulePopup
        open={openAddSchedule}
        close={() => setOpenAddSchedule(false)}
        actionOptions={mapDeviceTypeActionOptions[device?.type || ''] || []}
        apply={addSchedule}
      />
      <FullScreenDrawer open={open} onClose={close}>
        <FullScreenDrawerContent
          title='Schedule'
          cancel={close}
          cancelTitle='Close'
        >
          <div>
            <div className='mx-6 mb-1 text-gray-400 text-base'>Schedule(s)</div>
            <div className='relative mx-6 px-4 bg-white rounded-xl'>
              {Object.values(schedules).map((s, idx) => (
                <div key={s.id}>
                  {idx !== 0 && (
                    <Divider orientationMargin={0} className='!m-0' />
                  )}
                  <div className='flex items-center justify-between min-h-14'>
                    <div className='flex items-center truncate'>
                      <Tag color='processing' bordered={false}>
                        {mapActionName[s.action]}
                      </Tag>
                      {humanSchedules[s.id]}
                    </div>
                    <div className='pl-1'>
                      <Button
                        icon={<Trash2 size={16} className='text-rose-400' />}
                        shape='circle'
                        type='text'
                        onClick={() => deleteSchedule(s.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(schedules).length === 0 && (
              <div>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description='No schedule'
                >
                  <Button
                    type='primary'
                    onClick={() => setOpenAddSchedule(true)}
                  >
                    Add now
                  </Button>
                </Empty>
              </div>
            )}
          </div>
          <div className='fixed bottom-0 backdrop-2xl h-16 w-full flex items-center px-6'>
            <Button
              onClick={() => setOpenAddSchedule(true)}
              type='primary'
              size='large'
              icon={<PlusCircle size={18} className='-mb-0.5' />}
              className='w-full'
            >
              Add schedule
            </Button>
          </div>
        </FullScreenDrawerContent>
      </FullScreenDrawer>
    </>
  );
};

export default ListSchedulePopup;
