import React, { useState, useEffect } from 'react';
import { UserCheck, X, Ticket, MessageSquare, Send } from 'lucide-react';
import { NeoButton } from './ui/NeoButton';
import { NeoInput } from './ui/NeoInput';
import { NeoBadge } from './ui/NeoBadge';
import { api } from '../services/api';
import type { SupportTicket } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber?: string | null;
  conversationId?: number | null;
  onTicketCreated?: (ticketNumber: string) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  ticketNumber,
  conversationId,
  onTicketCreated,
}) => {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);

  // Creation form state (when opening modal manually)
  const [customerName, setCustomerName] = useState<string>('Alex Customer');
  const [customerEmail, setCustomerEmail] = useState<string>('alex.customer@example.com');
  const [category, setCategory] = useState<string>('general');
  const [priority, setPriority] = useState<string>('high');
  const [subject, setSubject] = useState<string>('Need assistance with retail order');
  const [summary, setSummary] = useState<string>('');
  const [creatingTicket, setCreatingTicket] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && ticketNumber) {
      loadTicketDetails(ticketNumber);
    } else {
      setTicket(null);
    }
  }, [isOpen, ticketNumber]);

  const loadTicketDetails = async (tNumber: string) => {
    setLoading(true);
    try {
      const tickets = await api.getTickets();
      const match = tickets.find((t) => t.ticket_number === tNumber);
      if (match) {
        setTicket(match);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;
    setCreatingTicket(true);

    try {
      const res = await api.createTicket({
        conversation_id: conversationId,
        customer_name: customerName,
        customer_email: customerEmail,
        category,
        priority,
        subject,
        summary,
      });
      setTicket(res);
      if (onTicketCreated) {
        onTicketCreated(res.ticket_number);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendCustomerReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !replyMessage.trim()) return;
    setSubmittingReply(true);

    try {
      await api.addTicketResponse(ticket.id, {
        sender_name: customerName || 'Customer',
        sender_role: 'customer',
        message: replyMessage.trim(),
      });
      setReplyMessage('');
      // Reload ticket
      loadTicketDetails(ticket.ticket_number);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] border-[4px] border-[#171717] rounded-[6px] shadow-[8px_8px_0_#171717] w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white border-[2px] border-[#171717] rounded-[2px] shadow-[2px_2px_0_#171717] flex items-center justify-center font-black hover:bg-stone-100"
        >
          <X className="w-5 h-5 text-[#171717]" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#FF6B6B] border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black">HUMAN SUPPORT TICKET</h3>
            <p className="text-xs font-bold text-stone-600">
              Direct escalation desk with conversation preservation
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center font-black text-sm uppercase animate-pulse">
            Loading Ticket Details...
          </div>
        ) : ticket ? (
          /* Inspecting an existing ticket */
          <div className="space-y-5">
            {/* Ticket Header Card */}
            <div className="p-4 bg-white border-[3px] border-[#171717] rounded-[4px] shadow-[4px_4px_0_#171717] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#4D7CFE]" />
                  <span className="font-black text-base">{ticket.ticket_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <NeoBadge
                    variant={
                      ticket.status === 'resolved'
                        ? 'lime'
                        : ticket.status === 'in_progress'
                        ? 'yellow'
                        : 'coral'
                    }
                  >
                    STATUS: {ticket.status.toUpperCase()}
                  </NeoBadge>
                  <NeoBadge variant="dark">PRIORITY: {ticket.priority.toUpperCase()}</NeoBadge>
                </div>
              </div>

              <div>
                <h4 className="font-black text-base">{ticket.subject}</h4>
                <p className="text-xs font-bold text-stone-700 mt-1">{ticket.summary}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs font-bold text-stone-600 pt-2 border-t">
                <span>Assigned: {ticket.assigned_agent || 'Queued for next available lead'}</span>
                <span>Queue Position: #{ticket.queue_position || 1}</span>
              </div>
            </div>

            {/* Conversation / Agent Responses */}
            <div className="space-y-3">
              <h5 className="font-black text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Live Ticket Activity ({ticket.responses?.length || 0})
              </h5>

              <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-[#F5F2EB] border-[2px] border-[#171717] rounded-[4px]">
                {ticket.responses && ticket.responses.length > 0 ? (
                  ticket.responses.map((resp) => (
                    <div
                      key={resp.id}
                      className={`p-3 border-[2px] border-[#171717] rounded-[3px] text-xs font-medium shadow-[2px_2px_0_#171717] ${
                        resp.sender_role === 'agent'
                          ? 'bg-[#B8F56A] text-[#171717] ml-4'
                          : resp.sender_role === 'customer'
                          ? 'bg-[#4D7CFE] text-white mr-4'
                          : 'bg-white text-stone-700 italic'
                      }`}
                    >
                      <div className="flex justify-between font-black uppercase text-[10px] mb-1">
                        <span>{resp.sender_name} ({resp.sender_role})</span>
                        <span>{new Date(resp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="font-sans font-bold">{resp.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-bold text-stone-500 text-center py-4">
                    Your ticket is queued. A support lead will review and respond shortly.
                  </p>
                )}
              </div>

              {/* Customer Follow-up Input */}
              <form onSubmit={handleSendCustomerReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Send an update or note to the assigned agent..."
                  className="flex-1 px-3 py-2 bg-white text-xs font-bold border-[2px] border-[#171717] rounded-[3px] shadow-[2px_2px_0_#171717] focus:outline-none"
                />
                <NeoButton type="submit" variant="yellow" size="sm" disabled={submittingReply}>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </NeoButton>
              </form>
            </div>
          </div>
        ) : (
          /* Creating a new ticket manually */
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <NeoInput
                label="YOUR NAME"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <NeoInput
                label="EMAIL ADDRESS"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  CATEGORY:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-white border-[3px] border-[#171717] rounded-[4px] font-bold text-xs shadow-[3px_3px_0_#171717] focus:outline-none"
                >
                  <option value="general">General Support</option>
                  <option value="order">Order Tracking & Shipping</option>
                  <option value="return">Return & Refund</option>
                  <option value="payment">Billing & Payments</option>
                  <option value="technical">Technical Product Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  PRIORITY LEVEL:
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 bg-white border-[3px] border-[#171717] rounded-[4px] font-bold text-xs shadow-[3px_3px_0_#171717] focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Standard Urgent)</option>
                  <option value="urgent">Urgent (Billing / Failed Delivery)</option>
                </select>
              </div>
            </div>

            <NeoInput
              label="SUBJECT"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                SUMMARY OF ISSUE:
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                placeholder="Explain what happened so our human specialist can jump right in..."
                required
                className="w-full p-3 bg-white border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] font-medium text-xs focus:outline-none"
              />
            </div>

            <NeoButton
              type="submit"
              variant="coral"
              size="lg"
              fullWidth
              disabled={creatingTicket}
            >
              {creatingTicket ? 'SUBMITTING TO AGENT DESK...' : 'ESCALATE TO HUMAN AGENT'}
            </NeoButton>
          </form>
        )}
      </div>
    </div>
  );
};
