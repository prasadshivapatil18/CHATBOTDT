import React from 'react';
import { Package, RotateCcw, UserCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { NeoCard } from './ui/NeoCard';
import { NeoBadge } from './ui/NeoBadge';

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  onOpenReturnModal: () => void;
  onOpenHumanModal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAction,
  onOpenReturnModal,
  onOpenHumanModal,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Neo-Brutalist Hero Banner */}
      <div className="bg-[#FFE156] border-[4px] border-[#171717] rounded-[6px] p-6 md:p-8 shadow-[8px_8px_0_#171717] relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="absolute top-3 right-3 rotate-6">
          <NeoBadge variant="coral" className="text-xs px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            100% WIT • 0% FLUFF
          </NeoBadge>
        </div>

        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-black tracking-widest uppercase text-stone-800 bg-white border-[2px] border-[#171717] inline-block px-2.5 py-0.5 rounded-[2px] shadow-[2px_2px_0_#171717]">
            NO BOT ENERGY ALLOWED
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#171717] leading-tight tracking-tight">
            SUPPORT WITHOUT THE <span className="bg-white px-2 py-0.5 border-[3px] border-[#171717] inline-block shadow-[3px_3px_0_#171717]">ROBOT</span> ENERGY.
          </h2>
          <p className="text-base md:text-lg font-bold text-[#171717]">
            Real answers. Quick fixes. A little personality. Zero unnecessary hold music.
          </p>
        </div>

        {/* Quick sample seed order links */}
        <div className="mt-6 pt-4 border-t-[2px] border-[#171717] flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-stone-800">
            Quick Demo Orders:
          </span>
          <button
            onClick={() => onSelectAction('Where is my order ORD-1001?')}
            className="text-xs font-black bg-white hover:bg-stone-100 border-[2px] border-[#171717] px-2.5 py-1 rounded-[2px] shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            📦 ORD-1001 (Delivered)
          </button>
          <button
            onClick={() => onSelectAction('Where is my order ORD-1002?')}
            className="text-xs font-black bg-white hover:bg-stone-100 border-[2px] border-[#171717] px-2.5 py-1 rounded-[2px] shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            🚚 ORD-1002 (Delayed)
          </button>
          <button
            onClick={() => onSelectAction('What is the status of ORD-1003?')}
            className="text-xs font-black bg-white hover:bg-stone-100 border-[2px] border-[#171717] px-2.5 py-1 rounded-[2px] shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            ⏳ ORD-1003 (Processing)
          </button>
        </div>
      </div>

      {/* 3 Prominent Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Track My Order */}
        <NeoCard
          variant="white"
          interactive
          onClick={() => onSelectAction('Can you help me track an order?')}
          className="border-[3px] border-[#171717] hover:bg-[#FFFDF5] group"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-[#FFE156] border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] flex items-center justify-center">
              <Package className="w-6 h-6 text-[#171717]" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-[#171717] transition-colors" />
          </div>
          <h3 className="text-xl font-black mt-4 mb-1">TRACK MY ORDER</h3>
          <p className="text-xs font-bold text-stone-600">
            Real-time shipping coordinates, live courier checkpoints, and arrival estimates.
          </p>
        </NeoCard>

        {/* 2. Return an Item */}
        <NeoCard
          variant="white"
          interactive
          onClick={onOpenReturnModal}
          className="border-[3px] border-[#171717] hover:bg-[#FFFDF5] group"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-[#B8F56A] border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-[#171717]" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-[#171717] transition-colors" />
          </div>
          <h3 className="text-xl font-black mt-4 mb-1">RETURN AN ITEM</h3>
          <p className="text-xs font-bold text-stone-600">
            30-day no-awkward-breakup policy. Instant prepaid shipping labels and quick refunds.
          </p>
        </NeoCard>

        {/* 3. Talk to a Human */}
        <NeoCard
          variant="white"
          interactive
          onClick={onOpenHumanModal}
          className="border-[3px] border-[#171717] hover:bg-[#FFFDF5] group"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-[#FF6B6B] border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-[#171717] transition-colors" />
          </div>
          <h3 className="text-xl font-black mt-4 mb-1">TALK TO A HUMAN</h3>
          <p className="text-xs font-bold text-stone-600">
            Get transferred to a human detective teammate without having to explain your issue twice.
          </p>
        </NeoCard>
      </div>
    </div>
  );
};
