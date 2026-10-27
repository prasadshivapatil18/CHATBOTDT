import React from 'react';

interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const NeoInput: React.FC<NeoInputProps> = ({
  error,
  label,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-black uppercase tracking-wider text-[#171717]">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 bg-white text-[#171717] font-bold text-sm
          border-[3px] border-[#171717] rounded-[4px]
          shadow-[3px_3px_0_#171717]
          focus:outline-none focus:shadow-[5px_5px_0_#171717] focus:border-[#171717]
          placeholder:text-stone-400 placeholder:font-medium
          disabled:bg-stone-100 disabled:cursor-not-allowed
          transition-all duration-100
          ${error ? 'border-[#FF6B6B] shadow-[3px_3px_0_#FF6B6B]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wide mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
