import React, { useState } from 'react';
import { Bot, Wrench, ChevronDown, ChevronUp, Ticket, Smile, ShieldAlert } from 'lucide-react';
import type { ChatMessage } from '../types';
import { NeoBadge } from './ui/NeoBadge';

interface MessageBubbleProps {
  message: ChatMessage;
  onSelectAction: (prompt: string) => void;
  onOpenTicketDetails?: (ticketNumber: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSelectAction,
  onOpenTicketDetails,
}) => {
  const [showTools, setShowTools] = useState(false);
  const isCustomer = message.sender === 'customer';
  const isAgent = message.sender === 'agent';

  // Format time
  const timeFormatted = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} my-4 max-w-3xl w-full`}>
      {/* Sender Header Label */}
      <div className="flex items-center gap-2 mb-1.5 px-1">
        {!isCustomer && (
          <div className="w-6 h-6 rounded-[2px] bg-[#FFE156] border-[2px] border-[#171717] flex items-center justify-center shadow-[1px_1px_0_#171717]">
            <Bot className="w-4 h-4 text-[#171717]" />
          </div>
        )}
        <span className="text-xs font-black tracking-wider uppercase text-stone-800">
          {isCustomer ? 'YOU' : isAgent ? 'HUMAN SUPPORT LEAD' : 'YOUR AI SIDEKICK'}
        </span>
        <span className="text-[11px] font-bold text-stone-600 font-mono">
          {timeFormatted}
        </span>

        {/* Dynamic Sentiment / Humor Badges */}
        {message.humor_used && (
          <NeoBadge variant="yellow" className="text-[10px] py-0">
            <Smile className="w-3 h-3 mr-0.5" />
            WIT DETECTED
          </NeoBadge>
        )}
        {message.sentiment === 'frustrated' && (
          <NeoBadge variant="coral" className="text-[10px] py-0">
            <ShieldAlert className="w-3 h-3 mr-0.5" />
            EMPATHY MODE
          </NeoBadge>
        )}
      </div>

      {/* Main Bubble */}
      <div
        className={`
          border-[3px] border-[#171717] rounded-[4px] p-4 text-sm font-medium leading-relaxed
          shadow-[4px_4px_0_#171717] max-w-full md:max-w-2xl
          ${isCustomer
            ? 'bg-[#4D7CFE] text-white shadow-[4px_4px_0_#171717]'
            : isAgent
            ? 'bg-[#B8F56A] text-[#171717]'
            : 'bg-white text-[#171717]'
          }
        `}
      >
        {/* Message Content with Markdown-like bold formatting */}
        <div className="whitespace-pre-wrap font-sans">
          {message.content.split('\n').map((line, idx) => (
            <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
              {line}
            </p>
          ))}
        </div>

        {/* Escalation Ticket Notice Box */}
        {message.ticket_number && (
          <div className="mt-3.5 p-3 bg-[#FFFDF5] text-[#171717] border-[2px] border-[#171717] rounded-[3px] shadow-[2px_2px_0_#171717]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#FF6B6B]" />
                <span className="font-black text-xs uppercase tracking-wide">
                  Support Ticket Generated: <span className="font-mono underline">{message.ticket_number}</span>
                </span>
              </div>
              {onOpenTicketDetails && (
                <button
                  onClick={() => onOpenTicketDetails(message.ticket_number!)}
                  className="text-xs font-black bg-[#FFE156] px-2 py-1 border-[2px] border-[#171717] rounded-[2px] shadow-[1px_1px_0_#171717] hover:bg-yellow-300"
                >
                  Inspect Ticket
                </button>
              )}
            </div>
            {message.ticket_summary && (
              <p className="text-xs text-stone-700 mt-1.5 font-bold">
                {message.ticket_summary}
              </p>
            )}
          </div>
        )}

        {/* Tool Invocations Accordion */}
        {message.tools_called && message.tools_called.length > 0 && (
          <div className="mt-3 pt-2.5 border-t-[2px] border-[#171717]/20">
            <button
              onClick={() => setShowTools(!showTools)}
              className="flex items-center justify-between w-full text-xs font-black uppercase tracking-wider text-stone-700 hover:text-black py-1"
            >
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                {message.tools_called.length} Verified Database Tool{message.tools_called.length > 1 ? 's' : ''} Called
              </span>
              {showTools ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTools && (
              <div className="mt-2 space-y-2">
                {message.tools_called.map((tool, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-2.5 bg-[#F9F7F1] text-[#171717] border-[2px] border-[#171717] rounded-[3px] text-xs font-mono"
                  >
                    <div className="font-bold flex items-center justify-between text-[#4D7CFE]">
                      <span>⚙️ {tool.tool_name}()</span>
                      <span className="text-[10px] text-green-700 bg-green-100 px-1 border border-green-700 rounded">SUCCESS</span>
                    </div>
                    <div className="mt-1 text-[11px] text-stone-600 truncate">
                      Args: {JSON.stringify(tool.arguments)}
                    </div>
                    <div className="mt-1 text-[11px] text-stone-800 bg-white p-1.5 border border-stone-300 rounded overflow-x-auto max-h-24">
                      {JSON.stringify(tool.output, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Follow-up Actions */}
      {!isCustomer && message.suggested_actions && message.suggested_actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {message.suggested_actions.map((act, idx) => (
            <button
              key={idx}
              onClick={() => onSelectAction(act)}
              className="text-xs font-black bg-white hover:bg-[#FFE156] text-[#171717] border-[2px] border-[#171717] px-3 py-1 rounded-[3px] shadow-[2px_2px_0_#171717] transition-all duration-100 hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              {act}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
