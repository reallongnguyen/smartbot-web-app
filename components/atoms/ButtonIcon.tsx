export interface SwitchIconProps {
  state: 'on' | 'off' | 'press';
}

function ButtonIcon(props: SwitchIconProps) {
  const { state } = props;

  return (
    <div className='relative w-10 h-6'>
      <div
        className={`
          absolute h-3 w-5 rounded left-1/2 top-0 -translate-x-1/2 transition duration-500 ease-out
          bg-teal-500
          ${state === 'press' ? 'translate-y-2' : 'translate-y-1'}
        `}
      />
      <div className='absolute bottom-0 left-0 w-full h-3 rounded bg-gray-200' />
    </div>
  );
}

export default ButtonIcon;
