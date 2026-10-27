import React from 'react';

interface NeoBadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'blue' | 'coral' | 'lime' | 'white' | 'dark';
  className?: string;
}

export const NeoBadge: React.FC<NeoBadgeProps> = ({
  children,
  variant = 'yellow',
  className = '',
}) => {
  const styles = {
    yellow: 'bg-[#FFE156] text-[#171717]',
    blue: 'bg-[#4D7CFE] text-white',
    coral: 'bg-[#FF6B6B] text-white',
    lime: 'bg-[#B8F56A] text-[#171717]',
    white: 'bg-white text-[#171717]',
    dark: 'bg-[#171717] text-white',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        border-[2px] border-[#171717] text-[11px] font-black uppercase tracking-wider
        rounded-[2px] shadow-[2px_2px_0_#171717]
        ${styles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
