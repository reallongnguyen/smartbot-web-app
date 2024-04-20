import { Button } from 'antd';
import { PropsWithChildren } from 'react';

export interface FullScreenDrawerContentProps {
  ok?: () => void;
  cancel?: () => void;
  title?: string;
  okTitle?: string;
  cancelTitle?: string;
}

const FullScreenDrawerContent = (
  props: PropsWithChildren<FullScreenDrawerContentProps>
) => {
  const { ok, cancel, title, cancelTitle, okTitle, children } = props;

  return (
    <div className='bg-gray-50 h-full'>
      <div className='relative flex items-center justify-center w-full h-12 mb-4'>
        <div className='font-semibold text-base'>{title}</div>
        {cancel && (
          <div className='absolute left-2'>
            <Button
              type='text'
              onClick={cancel}
              style={{ color: 'rgb(59 130 246)' }}
            >
              {cancelTitle || 'Cancel'}
            </Button>
          </div>
        )}
        {ok && (
          <div className='absolute right-2'>
            <Button
              type='text'
              onClick={ok}
              style={{ color: 'rgb(59 130 246)' }}
            >
              {okTitle || 'Apply'}
            </Button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default FullScreenDrawerContent;
