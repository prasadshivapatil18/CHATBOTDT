import React, { useState } from 'react';
import { X, Ticket, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import type { SupportTicket } from '../types';
import { NeoBadge } from './ui/NeoBadge';
import { NeoButton } from './ui/NeoButton';
import { api } from '../services/api';

interface TicketDetailModalProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onTicketUpdated,
}) => {
  const [agentName, setAgentName] = useState<string>('Support Lead Shiva');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(ticket?.status || 'open');
  const [priority, setPriority] = useState<string>(ticket?.priority || 'medium');

  if (!isOpen || !ticket) return null;

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setSubmitting(true);

    try {
      await api.addTicketResponse(ticket.id, {
        sender_name: agentName,
        sender_role: 'agent',
        message: replyMessage.trim(),
      });
      setReplyMessage('');
      onTicketUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      await api.updateTicket(ticket.id, {
        status: newStatus,
        assigned_agent: agentName,
      });
      onTicketUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePriority = async (newPriority: string) => {
    setPriority(newPriority);
    try {
      await api.updateTicket(ticket.id, { priority: newPriority });
      onTicketUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] border-[4px] border-[#171717] rounded-[6px] shadow-[8px_8px_0_#171717] w-full max-w-3xl p-6 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white border-[2px] border-[#171717] rounded-[2px] shadow-[2px_2px_0_#171717] flex items-center justify-center font-black hover:bg-stone-100"
        >
          <X className="w-5 h-5 text-[#171717]" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#171717] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-7 h-7 text-[#4D7CFE]" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">{ticket.ticket_number}</h3>
                <NeoBadge variant="dark">{ticket.category.toUpperCase()}</NeoBadge>
              </div>
              <p className="text-xs font-bold text-stone-600">
                Created: {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Selector */}
            <select
              value={status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="p-1.5 bg-white border-[2px] border-[#171717] rounded font-black text-xs uppercase shadow-[2px_2px_0_#171717]"
            >
              <option value="open">Open</option>
              <option value="queued">Queued</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Priority Selector */}
            <select
              value={priority}
              onChange={(e) => handleUpdatePriority(e.target.value)}
              className="p-1.5 bg-white border-[2px] border-[#171717] rounded font-black text-xs uppercase shadow-[2px_2px_0_#171717]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-white border-[3px] border-[#171717] rounded-[4px] shadow-[4px_4px_0_#171717] mb-5 space-y-2">
          <h4 className="font-black text-base">{ticket.subject}</h4>
          <p className="text-xs font-medium text-stone-800 bg-[#F5F2EB] p-2.5 border-[2px] border-[#171717] rounded">
            <span className="font-bold text-stone-900 block mb-0.5">AI-GENERATED ISSUE SUMMARY:</span>
            {ticket.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-bold">
            <div>
              <span className="text-stone-500 block">Customer:</span>
              <span>{ticket.customer_name}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Email:</span>
              <span>{ticket.customer_email}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Associated Order:</span>
              <span>{ticket.order_id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Assigned Lead:</span>
              <span className="text-[#4D7CFE]">{ticket.assigned_agent || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Response History */}
        <div className="space-y-3 mb-4">
          <h5 className="font-black text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Ticket Conversation Log ({ticket.responses?.length || 0})
          </h5>

          <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-[#F5F2EB] border-[2px] border-[#171717] rounded-[4px]">
            {ticket.responses && ticket.responses.length > 0 ? (
              ticket.responses.map((resp) => (
                <div
                  key={resp.id}
                  className={`p-3 border-[2px] border-[#171717] rounded-[3px] text-xs font-medium shadow-[2px_2px_0_#171717] ${
                    resp.sender_role === 'agent'
                      ? 'bg-[#B8F56A] text-[#171717] ml-6'
                      : resp.sender_role === 'customer'
                      ? 'bg-[#4D7CFE] text-white mr-6'
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
                No activity yet. Be the first to respond!
              </p>
            )}
          </div>
        </div>

        {/* Agent Reply Box */}
        <form onSubmit={handleSendResponse} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase">Responding as:</span>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="px-2 py-1 bg-white text-xs font-bold border-[2px] border-[#171717] rounded shadow-[1px_1px_0_#171717]"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your official resolution or note to the customer..."
              className="flex-1 px-3 py-2.5 bg-white text-xs font-bold border-[2px] border-[#171717] rounded-[3px] shadow-[2px_2px_0_#171717] focus:outline-none"
            />
            <NeoButton type="submit" variant="yellow" disabled={submitting}>
              <Send className="w-4 h-4" />
              <span>Send Response</span>
            </NeoButton>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => handleUpdateStatus('resolved')}
              className="text-xs font-black uppercase bg-[#B8F56A] px-3 py-1.5 border-[2px] border-[#171717] rounded-[2px] shadow-[2px_2px_0_#171717] flex items-center gap-1.5 hover:bg-lime-300"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Ticket as Resolved
            </button>
            <span className="text-[11px] font-bold text-stone-500">
              Customer receives notification immediately.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
