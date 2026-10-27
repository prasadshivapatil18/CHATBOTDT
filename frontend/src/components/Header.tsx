import React from 'react';
import { Bot, UserCheck, LayoutDashboard, MessageSquareText, Sparkles, RefreshCw, ShoppingBag } from 'lucide-react';
import { NeoBadge } from './ui/NeoBadge';
import { NeoButton } from './ui/NeoButton';

interface HeaderProps {
  currentView: 'chat' | 'admin';
  onViewChange: (view: 'chat' | 'admin') => void;
  onClearChat: () => void;
  onOpenHumanModal: () => void;
  isDemoMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onClearChat,
  onOpenHumanModal,
  isDemoMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF5] border-b-[3px] border-[#171717] px-4 md:px-8 py-3 shadow-[0_4px_0_#171717]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Assistant Identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFE156] border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] flex items-center justify-center font-black text-2xl">
            <Bot className="w-7 h-7 text-[#171717]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-1.5">
                <span>SIDEKICK AI</span>
                <span className="text-xs px-1.5 py-0.5 bg-[#4D7CFE] text-white border-[2px] border-[#171717] rounded-[2px] font-mono">v1.0</span>
              </h1>
              <NeoBadge variant="lime" className="hidden sm:inline-flex animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#171717] inline-block mr-1"></span>
                AI ON DUTY
              </NeoBadge>
            </div>
            <p className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#171717]" />
              NeoRetail Intelligent Support Lead
            </p>
          </div>
        </div>

        {/* Center: Mode Indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-[#F3EFE6] border-[2px] border-[#171717] px-3 py-1 rounded-[3px] shadow-[2px_2px_0_#171717]">
          <Sparkles className="w-4 h-4 text-[#4D7CFE]" />
          <span className="text-xs font-black uppercase tracking-wider">
            {isDemoMode ? 'Intelligent Demo Mode (Local Tool Calling)' : 'Live LLM Powered'}
          </span>
        </div>

        {/* Right: View Switcher & Action Controls */}
        <div className="flex items-center gap-2">
          {/* View Switcher: Customer Chat vs Admin Dashboard */}
          <div className="flex border-[3px] border-[#171717] rounded-[4px] overflow-hidden shadow-[3px_3px_0_#171717] bg-white">
            <button
              onClick={() => onViewChange('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase transition-colors ${
                currentView === 'chat'
                  ? 'bg-[#FFE156] text-[#171717]'
                  : 'bg-white text-stone-600 hover:bg-stone-100'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Customer Chat</span>
            </button>
            <div className="w-[2px] bg-[#171717]"></div>
            <button
              onClick={() => onViewChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase transition-colors ${
                currentView === 'admin'
                  ? 'bg-[#4D7CFE] text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Agent Desk</span>
            </button>
          </div>

          {currentView === 'chat' && (
            <>
              <NeoButton
                variant="coral"
                size="sm"
                onClick={onOpenHumanModal}
                title="Request Human Support Agent"
                className="hidden sm:inline-flex"
              >
                <UserCheck className="w-4 h-4" />
                <span>Talk to Human</span>
              </NeoButton>

              <NeoButton
                variant="white"
                size="sm"
                onClick={onClearChat}
                title="Restart conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </NeoButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
