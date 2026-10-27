import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-start my-4 max-w-sm">
      <div className="flex items-center gap-2 mb-1.5 px-1">
        <div className="w-6 h-6 rounded-[2px] bg-[#FFE156] border-[2px] border-[#171717] flex items-center justify-center shadow-[1px_1px_0_#171717]">
          <Bot className="w-4 h-4 text-[#171717]" />
        </div>
        <span className="text-xs font-black tracking-wider uppercase text-stone-800">
          YOUR AI SIDEKICK
        </span>
      </div>

      <div className="bg-white border-[3px] border-[#171717] rounded-[4px] px-4 py-3 shadow-[4px_4px_0_#171717] flex items-center gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-stone-700 animate-pulse">
          THE LITTLE ROBOTS ARE THINKING...
        </span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-[#FFE156] border-[2px] border-[#171717] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2.5 h-2.5 bg-[#4D7CFE] border-[2px] border-[#171717] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2.5 h-2.5 bg-[#FF6B6B] border-[2px] border-[#171717] rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};
