const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

const Spinner = ({ size = 'md', className = '' }) => (
  <div
    className={`
      ${sizeMap[size]}
      border-neutral-700 border-t-violet-500
      rounded-full animate-spin
      ${className}
    `}
  />
);

export default Spinner;
