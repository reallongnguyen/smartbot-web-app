export interface SwitchIconProps {
  state: 'on' | 'off';
}

function SwitchIcon(props: SwitchIconProps) {
  const { state } = props;

  return (
    <div className='relative h-10 w-6 rounded-md bg-gray-200'>
      <div
        className={`
          absolute h-5 w-5 rounded left-1/2 top-0 -translate-x-1/2 transition duration-500 ease-out
          ${
            state == 'on'
              ? 'bg-teal-500 translate-y-0.5'
              : 'bg-gray-400 translate-y-[1.125rem]'
          }
        `}
      />
    </div>
  );
}

export default SwitchIcon;
