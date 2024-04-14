export interface GeneralDeviceIconProps {
  icon: React.ReactNode;
  state?: 'on' | 'off';
}

function GeneralDeviceIcon(props: GeneralDeviceIconProps) {
  const { icon, state } = props;

  return (
    <div className='relative'>
      {state === 'on' && (
        <span className='absolute top-0 right-0 flex h-3 w-3 translate-x-1/2 -translate-y-1/2'>
          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75'></span>
          <span className='relative inline-flex rounded-full h-3 w-3 bg-sky-500'></span>
        </span>
      )}
      <div
        className={`
          flex items-center justify-center h-10 px-0.5 rounded-md
          ${state === 'on' ? 'bg-teal-500' : 'bg-gray-200'}
        `}
      >
        {icon}
      </div>
    </div>
  );
}

export default GeneralDeviceIcon;
