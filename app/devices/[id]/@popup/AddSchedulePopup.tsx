import FullScreenDrawer from '@/components/templates/FullScreenDrawer';
import FullScreenDrawerContent from '@/components/templates/FullScreenDrawerContent';
import { Input, InputRef, Select, Switch, message } from 'antd';
import {
  ChangeEvent,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import crontrue from 'cronstrue';

export interface AddSchedulePopupProps {
  open: boolean;
  close: () => void;
  actionOptions: { action: string; name: string }[];
  apply: (schedule: string, isRepeat: boolean, action: string) => void;
}

const AddSchedulePopup = (props: PropsWithChildren<AddSchedulePopupProps>) => {
  const { open, close, actionOptions, apply } = props;

  const [crons, setCrons] = useState(['*', '*', '*', '*', '*', '*']);
  const [focusIdx, setFocusIdx] = useState(-1);
  const [isRepeat, setIsRepeat] = useState(true);
  const [action, setAction] = useState<string>('');

  const ref0 = useRef<InputRef>(null);
  const ref1 = useRef<InputRef>(null);
  const ref2 = useRef<InputRef>(null);
  const ref3 = useRef<InputRef>(null);
  const ref4 = useRef<InputRef>(null);
  const ref5 = useRef<InputRef>(null);
  const refs = useMemo(() => [ref0, ref1, ref2, ref3, ref4, ref5], []);

  const setCron = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const newCrons = [...crons];
    newCrons[index] = e.target.value;

    setCrons(newCrons);
  };

  const handleFocus = (index: number) => () => {
    setFocusIdx(index);
  };

  const human = useMemo(() => {
    try {
      return crontrue.toString(crons.join(' '), {
        throwExceptionOnParseError: true,
      });
    } catch (err) {
      return 'Invalid cron format';
    }
  }, [crons]);

  const mapUnitToLabel: Record<string, ReactNode> = {
    second: 'second',
    minute: 'minute',
    hour: 'hour',
    dayMonth: (
      <>
        day<p>(month)</p>
      </>
    ),
    month: 'month',
    dayWeek: (
      <>
        day<p>(week)</p>
      </>
    ),
  };

  const createSchedule = () => {
    const schedule = crons.join(' ');

    try {
      console.log(crontrue.toString(schedule));
    } catch (err) {
      message.error({ content: 'Invalid schedule' });

      return;
    }

    apply(schedule, isRepeat, action);
  };

  useEffect(() => {
    if (actionOptions[0]) {
      setAction(actionOptions[0].action);
    }
  }, [actionOptions]);

  useEffect(() => {
    if (human.toLowerCase().includes('every')) {
      setIsRepeat(true);
    }
  }, [human]);

  useEffect(() => {
    if (focusIdx >= 0 && refs[focusIdx] && refs[focusIdx].current) {
      setTimeout(() => refs[focusIdx].current?.select(), 100);
    }
  }, [focusIdx, refs]);

  return (
    <FullScreenDrawer open={open} onClose={close}>
      <FullScreenDrawerContent
        title='New schedule'
        cancel={close}
        ok={createSchedule}
      >
        <div className='mt-8'>
          <div className='mx-6 mb-1 text-gray-400 text-base'>Schedule</div>
          <div className='relative mx-6 p-4 bg-white rounded-xl space-y-2'>
            <div className='text-center text-base'>{human}</div>
            <div className='grid grid-cols-6 gap-1 pt-3'>
              {['second', 'minute', 'hour', 'dayMonth', 'month', 'dayWeek'].map(
                (unit, index) => (
                  <Input
                    key={unit}
                    ref={refs[index]}
                    variant='filled'
                    value={crons[index]}
                    onChange={setCron(index)}
                    onFocus={handleFocus(index)}
                    onBlur={handleFocus(-1)}
                    className='text-center'
                  />
                )
              )}
            </div>
            <div className='grid grid-cols-6 gap-1 text-sm'>
              {['second', 'minute', 'hour', 'dayMonth', 'month', 'dayWeek'].map(
                (unit, index) => (
                  <div
                    className={`
                    text-center ${
                      focusIdx === index ? 'text-blue-500' : 'text-gray-400'
                    }
                  `}
                    key={unit}
                  >
                    {mapUnitToLabel[unit]}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        <div className='mt-8 mx-6 p-4 bg-white rounded-xl'>
          <div className='flex justify-between items-center'>
            <div>Repeat</div>
            <Switch value={isRepeat} onChange={setIsRepeat} />
          </div>
        </div>
        <div className='mt-8'>
          <div className='mx-6 text-base mb-1 text-gray-400'>
            Action that you want to schedule
          </div>
          <div className='mx-6 p-4 bg-white rounded-xl'>
            <div className='flex justify-between items-center'>
              <div>Action</div>
              <Select value={action} onSelect={setAction} variant='borderless'>
                {actionOptions.map((option) => (
                  <Select.Option key={option.action}>
                    {option.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </FullScreenDrawerContent>
    </FullScreenDrawer>
  );
};

export default AddSchedulePopup;
