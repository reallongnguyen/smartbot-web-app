import { Drawer } from 'antd';
import { PropsWithChildren } from 'react';

export interface FullScreenDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FullScreenDrawer = (props: PropsWithChildren<FullScreenDrawerProps>) => {
  const { children, open, onClose } = props;
  return (
    <Drawer
      placement='bottom'
      open={open}
      onClose={onClose}
      height='96dvh'
      styles={{
        body: { padding: 0 },
        header: {
          display: 'none',
        },
        wrapper: {
          borderRadius: '12px 12px 0 0',
        },
        content: {
          borderRadius: '12px 12px 0 0',
        },
      }}
    >
      {children}
    </Drawer>
  );
};

export default FullScreenDrawer;
