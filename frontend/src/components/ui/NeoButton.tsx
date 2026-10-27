import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'blue' | 'coral' | 'lime' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    yellow: 'bg-[#FFE156] text-[#171717] hover:bg-[#FFD930]',
    blue: 'bg-[#4D7CFE] text-white hover:bg-[#3D6CEE]',
    coral: 'bg-[#FF6B6B] text-white hover:bg-[#FF5252]',
    lime: 'bg-[#B8F56A] text-[#171717] hover:bg-[#A6E852]',
    white: 'bg-white text-[#171717] hover:bg-[#FAF8F2]',
    dark: 'bg-[#171717] text-white hover:bg-[#2A2A2A]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs uppercase tracking-wider',
    md: 'px-5 py-2.5 text-sm uppercase tracking-wide',
    lg: 'px-7 py-3.5 text-base uppercase tracking-wider font-extrabold',
  };

  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        border-[3px] border-[#171717] font-black rounded-[4px]
        box-shadow-[4px_4px_0_#171717] shadow-[4px_4px_0_#171717]
        transition-all duration-100 ease-in-out cursor-pointer
        hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#171717]
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#171717]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
