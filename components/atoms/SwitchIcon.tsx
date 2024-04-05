export interface SwitchIconProps {
  state: 'on' | 'off';
}

function SwitchIcon(props: SwitchIconProps) {
  const { state } = props;

  return (
    <div className='relative h-8 w-5 rounded-md bg-gray-200'>
      <div
        className={`
          absolute h-4 w-4 rounded left-1/2 top-0 -translate-x-1/2 transition duration-500
          ${
            state == 'on'
              ? 'bg-teal-500 translate-y-0.5'
              : 'bg-gray-400 translate-y-3.5'
          }
        `}
      />
    </div>
  );
}

export default SwitchIcon;
