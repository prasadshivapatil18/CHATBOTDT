import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquareHeart, AlertCircle, Sparkles, ChevronRight, ChevronLeft, Bot } from 'lucide-react';
import type { ChatMessage } from '../types';
import { api } from '../services/api';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';
import { FeedbackModal } from './FeedbackModal';
import { ReturnModal } from './ReturnModal';
import { TicketModal } from './TicketModal';
import { SupportOrb, type AssistantVisualState } from './3d/SupportOrb';
import { NeoBadge } from './ui/NeoBadge';

interface ChatInterfaceProps {
  onOpenHumanModal: () => void;
  isHumanModalOpen: boolean;
  onCloseHumanModal: () => void;
  initialPrompt?: string | null;
  onPromptHandled?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onOpenHumanModal,
  isHumanModalOpen,
  onCloseHumanModal,
  initialPrompt,
  onPromptHandled,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [sessionId] = useState<string>(() => 'sess_' + Math.random().toString(36).substring(2, 10));
  const [error, setError] = useState<string | null>(null);
  const [assistantState, setAssistantState] = useState<AssistantVisualState>('idle');
  const [isCompanionVisible, setIsCompanionVisible] = useState<boolean>(true);

  // Modals state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isReturnOpen, setIsReturnOpen] = useState<boolean>(false);
  const [selectedTicketNumber, setSelectedTicketNumber] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stateResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Set assistant state with automatic reset to idle after duration
  const updateAssistantState = (newState: AssistantVisualState, autoResetMs?: number) => {
    if (stateResetTimerRef.current) {
      clearTimeout(stateResetTimerRef.current);
      stateResetTimerRef.current = null;
    }
    setAssistantState(newState);

    if (autoResetMs && autoResetMs > 0) {
      stateResetTimerRef.current = setTimeout(() => {
        setAssistantState('idle');
      }, autoResetMs);
    }
  };

  // Handle typing input changes: update to 'waiting' if typing
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (!loading && val.trim().length > 0 && assistantState === 'idle') {
      updateAssistantState('waiting', 5000);
    } else if (!loading && val.trim().length === 0 && assistantState === 'waiting') {
      updateAssistantState('idle');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'customer',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    // 3D Visual state: transition to processing, then generating
    updateAssistantState('processing');
    const generatingTimer = setTimeout(() => {
      setAssistantState((curr) => (curr === 'processing' ? 'generating' : curr));
    }, 400);

    try {
      const res = await api.sendMessage({
        conversation_id: conversationId,
        session_id: sessionId,
        message: text,
        customer_name: 'Alex Rivera',
        customer_email: 'alex.rivera@example.com',
      });

      clearTimeout(generatingTimer);

      if (!conversationId && res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      const aiMsg: ChatMessage = {
        id: res.message_id || 'ai_' + Date.now(),
        sender: 'ai',
        content: res.reply,
        sentiment: res.sentiment,
        humor_used: res.humor_used,
        tools_called: res.tools_called,
        suggested_actions: res.suggested_actions,
        ticket_number: res.ticket_number,
        ticket_summary: res.ticket_summary,
        is_escalated: res.is_escalated,
        created_at: res.created_at || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Chat-aware 3D response mapping
      if (res.is_escalated) {
        updateAssistantState('escalated', 5000);
        if (res.ticket_number) {
          setSelectedTicketNumber(res.ticket_number);
        }
      } else if (res.tools_called && res.tools_called.length > 0) {
        // Successful tool lookup (track_order, check_return_eligibility, etc.)
        updateAssistantState('success', 3500);
      } else {
        updateAssistantState('idle');
      }
    } catch (err: any) {
      clearTimeout(generatingTimer);
      console.error('Chat error:', err);
      updateAssistantState('error', 4000);
      setError(err.message || 'Trouble connecting to the support neural core. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process incoming initial prompt from Hero
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
      if (onPromptHandled) {
        onPromptHandled();
      }
    }
  }, [initialPrompt]);

  const handleInspectTicket = (ticketNum: string) => {
    setSelectedTicketNumber(ticketNum);
    onOpenHumanModal();
  };

  return (
    <div id="chat-section" className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Main Grid: Messages Area + Desktop 3D Companion Dock */}
      <div className="flex-1 flex gap-4 md:gap-6 overflow-hidden min-h-[500px]">
        {/* Left Column: Chat Conversation */}
        <div className="flex-1 flex flex-col bg-white border-[3px] border-[#171717] rounded-[6px] shadow-[6px_6px_0_#171717] overflow-hidden">
          {/* Top Chat Bar: Status, Session, Quick Actions */}
          <div className="px-4 py-2.5 bg-[#FFFDF5] border-b-[3px] border-[#171717] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[4px] bg-[#FFE156] border-[2px] border-[#171717] shadow-[2px_2px_0_#171717] flex items-center justify-center font-black">
                <Bot className="w-5 h-5 text-[#171717]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#171717]">
                    ASTRA SUPPORT AGENT
                  </span>
                  <NeoBadge
                    variant={
                      assistantState === 'escalated'
                        ? 'coral'
                        : assistantState === 'success'
                        ? 'lime'
                        : assistantState === 'error'
                        ? 'coral'
                        : assistantState === 'processing' || assistantState === 'generating'
                        ? 'blue'
                        : 'white'
                    }
                    className="text-[10px] py-0 px-1.5 uppercase font-mono font-bold"
                  >
                    {assistantState}
                  </NeoBadge>
                </div>
                <span className="text-[10px] font-bold text-stone-500">
                  {conversationId ? `Conversation #${conversationId}` : 'New Customer Session'}
                </span>
              </div>
            </div>

            {/* Right: Companion toggle button for desktop */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCompanionVisible(!isCompanionVisible)}
                className="hidden lg:flex items-center gap-1 text-[11px] font-black uppercase bg-[#F3EFE6] hover:bg-[#FFE156] border-[2px] border-[#171717] px-2 py-1 rounded-[3px] shadow-[2px_2px_0_#171717] transition-all"
                title="Toggle 3D Assistant Dock"
              >
                {isCompanionVisible ? (
                  <>
                    <span>Hide 3D Core</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Show 3D Core</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Chat scrollable message container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-[#FAF8F2]">
            {messages.length === 0 ? (
              <QuickActions
                onSelectAction={(prompt) => handleSendMessage(prompt)}
                onOpenReturnModal={() => setIsReturnOpen(true)}
                onOpenHumanModal={onOpenHumanModal}
              />
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onSelectAction={(actionPrompt) => handleSendMessage(actionPrompt)}
                  onOpenTicketDetails={handleInspectTicket}
                />
              ))
            )}

            {loading && <TypingIndicator />}

            {error && (
              <div className="p-3 bg-[#FF6B6B] text-white border-[3px] border-[#171717] rounded-[4px] shadow-[4px_4px_0_#171717] flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </span>
                <button
                  onClick={() => handleSendMessage()}
                  className="bg-white text-[#171717] px-2.5 py-1 rounded-[2px] border-[2px] border-[#171717] uppercase font-black hover:bg-stone-100"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Sticky Action Bar & Message Input */}
          <div className="p-3 bg-white border-t-[3px] border-[#171717] space-y-2">
            {messages.length > 0 && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReturnOpen(true)}
                    className="text-[11px] font-black uppercase tracking-wider bg-white hover:bg-[#B8F56A] border-[2px] border-[#171717] px-2.5 py-1 rounded-[3px] shadow-[2px_2px_0_#171717] transition-all"
                  >
                    🔄 Returns & Refunds
                  </button>
                  <button
                    onClick={onOpenHumanModal}
                    className="text-[11px] font-black uppercase tracking-wider bg-white hover:bg-[#FF6B6B] hover:text-white border-[2px] border-[#171717] px-2.5 py-1 rounded-[3px] shadow-[2px_2px_0_#171717] transition-all"
                  >
                    🕵️ Escalate to Agent
                  </button>
                </div>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-[11px] font-black uppercase tracking-wider bg-[#FFE156] border-[2px] border-[#171717] px-2.5 py-1 rounded-[3px] shadow-[2px_2px_0_#171717] flex items-center gap-1 hover:bg-yellow-300"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                  Feedback
                </button>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2 items-center"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Ask anything about orders, returns, warranty, or policies..."
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#FFFDF5] text-[#171717] font-bold text-sm border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] focus:outline-none focus:shadow-[5px_5px_0_#171717] placeholder:text-stone-400"
                />
                <span className="hidden sm:inline-block absolute right-3 top-3 text-[10px] font-black uppercase bg-[#F3EFE6] border border-[#171717] px-1.5 py-0.5 rounded text-stone-600">
                  Enter ↵
                </span>
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="px-5 py-3 bg-[#FFE156] hover:bg-[#FFD930] text-[#171717] font-black text-sm uppercase tracking-wider border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Desktop 3D Companion Dock */}
        {isCompanionVisible && (
          <div className="hidden lg:flex flex-col w-80 bg-white border-[3px] border-[#171717] rounded-[6px] shadow-[6px_6px_0_#171717] p-4 space-y-4 shrink-0 overflow-y-auto">
            {/* Dock Header */}
            <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#171717]">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#4D7CFE]" />
                  ASTRA 3D COMPANION
                </h3>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                  GLSL Liquid Shaders
                </p>
              </div>
              <NeoBadge
                variant={
                  assistantState === 'escalated'
                    ? 'coral'
                    : assistantState === 'success'
                    ? 'lime'
                    : assistantState === 'processing' || assistantState === 'generating'
                    ? 'blue'
                    : 'lime'
                }
                className="text-[10px] px-2 py-0.5"
              >
                {assistantState.toUpperCase()}
              </NeoBadge>
            </div>

            {/* 3D Canvas Box */}
            <div className="relative w-full aspect-square rounded-[6px] bg-gradient-to-b from-[#FFFDF5] to-[#F2EDE0] border-[3px] border-[#171717] shadow-[4px_4px_0_#171717] overflow-hidden flex flex-col items-center justify-center group">
              <SupportOrb state={assistantState} size="companion" />
              <div className="absolute bottom-2 inset-x-2 text-center bg-white/90 backdrop-blur-sm border border-[#171717] rounded-[2px] py-0.5 text-[9px] font-bold text-stone-600">
                Move cursor near orb to deform surface
              </div>
            </div>

            {/* Real-time State Guide */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                Live State Feedback
              </span>
              <div className="bg-[#FFFDF5] border-[2px] border-[#171717] rounded-[4px] p-2.5 space-y-2 text-[11px] font-bold text-stone-700">
                <div className="flex items-center justify-between">
                  <span>Idle Breathing:</span>
                  <span className="font-mono text-[10px] bg-stone-100 px-1 border border-stone-300 rounded">Gold / Iridescent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Query Processing:</span>
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-1 border border-blue-300 rounded">Blue Pulse</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Speech Ripples:</span>
                  <span className="font-mono text-[10px] bg-yellow-100 text-yellow-800 px-1 border border-yellow-300 rounded">Soundwaves</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Order Found:</span>
                  <span className="font-mono text-[10px] bg-green-100 text-green-800 px-1 border border-green-300 rounded">Lime Green</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Human Escalated:</span>
                  <span className="font-mono text-[10px] bg-red-100 text-red-800 px-1 border border-red-300 rounded">Coral Red</span>
                </div>
              </div>
            </div>

            {/* Quick Helper Actions */}
            <div className="pt-2 border-t-[2px] border-[#171717] space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                Quick Shortcuts
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleSendMessage('Track my demo order ORD-DEMO-1001')}
                  className="w-full text-left text-xs font-black bg-white hover:bg-[#FFE156] border-[2px] border-[#171717] px-2.5 py-1.5 rounded-[3px] shadow-[2px_2px_0_#171717] transition-all"
                >
                  📦 Track Delivered (ORD-1001)
                </button>
                <button
                  onClick={() => handleSendMessage('What is the delay on ORD-DEMO-1002?')}
                  className="w-full text-left text-xs font-black bg-white hover:bg-[#FFE156] border-[2px] border-[#171717] px-2.5 py-1.5 rounded-[3px] shadow-[2px_2px_0_#171717] transition-all"
                >
                  🚚 Track Delayed (ORD-1002)
                </button>
                <button
                  onClick={() => setIsReturnOpen(true)}
                  className="w-full text-left text-xs font-black bg-white hover:bg-[#B8F56A] border-[2px] border-[#171717] px-2.5 py-1.5 rounded-[3px] shadow-[2px_2px_0_#171717] transition-all"
                >
                  🔄 Open Return Generator
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        conversationId={conversationId}
      />

      <ReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        onReturnGenerated={(ord, retCode) => {
          handleSendMessage(`I just generated return request ${retCode} for order ${ord}. What are the next steps?`);
        }}
      />

      <TicketModal
        isOpen={isHumanModalOpen}
        onClose={onCloseHumanModal}
        ticketNumber={selectedTicketNumber}
        conversationId={conversationId}
        onTicketCreated={(tNum) => {
          setSelectedTicketNumber(tNum);
          handleSendMessage(`I've opened human support ticket ${tNum}.`);
        }}
      />
    </div>
  );
};
