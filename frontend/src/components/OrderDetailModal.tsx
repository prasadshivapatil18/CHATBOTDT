import React from 'react';
import {
  X,
  Package,
  Truck,
  Ticket,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';
import type { Order, SupportTicket } from '../types';
import { NeoBadge } from './ui/NeoBadge';
import { NeoButton } from './ui/NeoButton';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  associatedTickets?: SupportTicket[];
  onOpenTicket?: (ticket: SupportTicket) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  associatedTickets = [],
  onOpenTicket,
}) => {
  if (!isOpen || !order) return null;

  const getStatusBadgeVariant = (status: string): 'yellow' | 'blue' | 'coral' | 'lime' | 'white' | 'dark' => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'lime';
      case 'shipped':
        return 'blue';
      case 'processing':
        return 'yellow';
      case 'delayed':
        return 'coral';
      case 'cancelled':
      case 'returned':
        return 'dark';
      default:
        return 'white';
    }
  };

  const getPaymentBadgeVariant = (paymentStatus?: string): 'yellow' | 'blue' | 'coral' | 'lime' | 'white' | 'dark' => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
        return 'lime';
      case 'refunded':
        return 'dark';
      case 'refund_pending':
        return 'yellow';
      case 'failed':
      case 'duplicate_hold':
      case 'security_hold':
        return 'coral';
      default:
        return 'white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#FFFDF5] border-[4px] border-[#171717] rounded-[6px] shadow-[8px_8px_0_#171717] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#FFE156] border-b-[3px] border-[#171717]">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#171717]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg text-[#171717]">
                  {order.order_number}
                </span>
                {order.is_demo && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#FF6B6B] text-white px-2 py-0.5 border-[2px] border-[#171717] rounded-[2px] shadow-[1px_1px_0_#171717]">
                    DEMO ORDER
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-stone-700">
                Placed on {new Date(order.order_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-stone-100 border-[2px] border-[#171717] rounded-[2px] shadow-[2px_2px_0_#171717] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5 text-[#171717]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Status Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-white border-[2px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717]">
            <div>
              <span className="text-[10px] font-black uppercase text-stone-500 block">
                Order Status
              </span>
              <NeoBadge variant={getStatusBadgeVariant(order.status)} className="mt-1">
                {order.status.toUpperCase()}
              </NeoBadge>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-stone-500 block">
                Payment Status
              </span>
              <NeoBadge variant={getPaymentBadgeVariant(order.payment_status)} className="mt-1">
                {(order.payment_status || 'PAID').toUpperCase()}
              </NeoBadge>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-stone-500 block">
                Return Eligibility
              </span>
              <NeoBadge variant={order.return_eligibility ? 'lime' : 'coral'} className="mt-1">
                {order.return_eligibility ? 'ELIGIBLE' : 'INELIGIBLE'}
              </NeoBadge>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-stone-500 block">
                Total Amount
              </span>
              <span className="font-mono font-black text-base text-[#171717] block mt-0.5">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Scenario & Support Notes */}
          {order.support_notes && (
            <div className="p-3.5 bg-[#FFF9D2] border-[2px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717]">
              <div className="flex items-center gap-1.5 mb-1 text-xs font-black uppercase text-[#171717]">
                <FileText className="w-4 h-4 text-[#4D7CFE]" />
                <span>Demonstration Scenario & Support Notes</span>
              </div>
              <p className="text-xs font-bold text-stone-800 leading-relaxed">
                {order.support_notes}
              </p>
            </div>
          )}

          {/* Customer & Shipping Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 bg-white border-[2px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] space-y-2">
              <h4 className="font-black text-xs uppercase flex items-center gap-1.5 text-stone-800 border-b border-[#171717] pb-1.5">
                <User className="w-4 h-4 text-[#4D7CFE]" />
                Customer Account Information
              </h4>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-stone-500 font-bold">Name: </span>
                  <span className="font-black text-[#171717]">{order.customer_name}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-bold">Email: </span>
                  <span className="font-mono font-bold text-stone-800">{order.customer_email}</span>
                </div>
                {order.customer_id && (
                  <div>
                    <span className="text-stone-500 font-bold">Account ID: </span>
                    <span className="font-mono font-bold text-stone-800">USR-DEMO-{order.order_number.replace('ORD-DEMO-', '')}</span>
                  </div>
                )}
                <div>
                  <span className="text-stone-500 font-bold">Address: </span>
                  <span className="font-bold text-stone-800">{order.shipping_address}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment States */}
            <div className="p-4 bg-white border-[2px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] space-y-2">
              <h4 className="font-black text-xs uppercase flex items-center gap-1.5 text-stone-800 border-b border-[#171717] pb-1.5">
                <Truck className="w-4 h-4 text-[#B8F56A]" />
                Logistics & Payment Details
              </h4>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-stone-500 font-bold">Carrier: </span>
                  <span className="font-black">{order.carrier || 'NeoExpress Logistics'}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-bold">Tracking: </span>
                  <span className="font-mono font-bold text-[#4D7CFE]">
                    {order.tracking_number || 'Pending Assignment'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 font-bold">Delivery: </span>
                  <span className="font-bold">
                    {order.actual_delivery || order.estimated_delivery || 'In Processing'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 font-bold">Payment Method: </span>
                  <span className="font-bold">{order.payment_method || 'Credit Card (Masked)'}</span>
                </div>
                {order.refund_amount ? (
                  <div>
                    <span className="text-stone-500 font-bold">Refunded: </span>
                    <span className="font-mono font-black text-purple-700">
                      ${order.refund_amount.toFixed(2)} ({order.refund_status})
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div className="p-4 bg-white border-[2px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] space-y-3">
            <h4 className="font-black text-xs uppercase flex items-center gap-1.5 text-stone-800">
              <Package className="w-4 h-4 text-[#FFE156]" />
              Order Items ({order.items?.length || 0})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F3EFE6] border-b-[2px] border-[#171717] uppercase text-[10px] font-black">
                  <tr>
                    <th className="p-2">Product Name</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-bold">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="p-2 font-black text-[#171717]">{item.product_name}</td>
                      <td className="p-2 font-mono text-[11px] text-stone-500">{item.sku || 'SKU-RETAIL'}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right font-mono">${item.unit_price.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-black">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Associated Support Tickets Section */}
          <div className="p-4 bg-white border-[2px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase flex items-center gap-1.5 text-stone-800">
                <Ticket className="w-4 h-4 text-[#FF6B6B]" />
                Associated Support Escalations ({associatedTickets.length})
              </h4>
            </div>

            {associatedTickets.length === 0 ? (
              <p className="text-xs text-stone-500 font-bold italic py-2">
                No active support tickets linked to this order. Escalation workflow has not been triggered.
              </p>
            ) : (
              <div className="space-y-2">
                {associatedTickets.map((tck) => (
                  <div
                    key={tck.id}
                    className="flex items-center justify-between p-2.5 bg-[#FFFDF5] border-[2px] border-[#171717] rounded-[3px] shadow-[2px_2px_0_#171717]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-[#4D7CFE]">
                          {tck.ticket_number}
                        </span>
                        <NeoBadge
                          variant={tck.status === 'resolved' ? 'lime' : 'coral'}
                          className="text-[9px]"
                        >
                          {tck.status.toUpperCase()}
                        </NeoBadge>
                        <span className="text-[10px] font-bold text-stone-500 uppercase">
                          Priority: {tck.priority}
                        </span>
                      </div>
                      <p className="text-xs font-black mt-1 text-[#171717]">{tck.subject}</p>
                    </div>

                    {onOpenTicket && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenTicket(tck);
                        }}
                        className="px-2.5 py-1 bg-[#171717] text-white hover:bg-[#FFE156] hover:text-[#171717] border-[2px] border-[#171717] rounded-[2px] text-xs font-black uppercase transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F3EFE6] border-t-[3px] border-[#171717] flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-600">
            Sidekick AI Demo Framework • Grounded Data Integrity
          </span>
          <NeoButton variant="dark" size="sm" onClick={onClose}>
            Close Inspector
          </NeoButton>
        </div>
      </div>
    </div>
  );
};
