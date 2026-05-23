import React from 'react';

interface WavyDividerProps {
  color?: string;
  position?: 'top' | 'bottom';
  className?: string;
  flip?: boolean;
}

const WavyDivider: React.FC<WavyDividerProps> = ({ 
  color = 'fill-background', 
  position = 'bottom',
  className = '',
  flip = false
}) => {
  return (
    <div className={`absolute left-0 w-full overflow-hidden leading-[0] z-20 ${position === 'top' ? 'top-[-1px]' : 'bottom-[-1px]'} ${className}`}>
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none" 
        className={`relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px] ${color} ${flip ? 'scale-y-[-1]' : ''}`}
      >
        <path 
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C49.1,19.26,99,29.83,151,33,208.6,36.5,263.6,56.5,321.39,56.44Z"
          fillOpacity="1"
        ></path>
      </svg>
    </div>
  );
};

export default WavyDivider;
