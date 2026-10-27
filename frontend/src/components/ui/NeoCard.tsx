import React from 'react';

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'yellow' | 'blue' | 'coral' | 'lime' | 'muted';
  shadowSize?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  variant = 'white',
  shadowSize = 'md',
  interactive = false,
  className = '',
  ...props
}) => {
  const bgStyles = {
    white: 'bg-white',
    yellow: 'bg-[#FFE156]',
    blue: 'bg-[#4D7CFE] text-white',
    coral: 'bg-[#FF6B6B] text-white',
    lime: 'bg-[#B8F56A]',
    muted: 'bg-[#F5F2EB]',
  };

  const shadowStyles = {
    sm: 'shadow-[3px_3px_0_#171717]',
    md: 'shadow-[5px_5px_0_#171717]',
    lg: 'shadow-[7px_7px_0_#171717]',
  };

  return (
    <div
      className={`
        border-[3px] border-[#171717] rounded-[4px] p-5
        ${bgStyles[variant]}
        ${shadowStyles[shadowSize]}
        ${interactive ? 'transition-all duration-150 ease-out hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_#171717] cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
