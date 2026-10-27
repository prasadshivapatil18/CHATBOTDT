import React, { useState } from 'react';
import { RotateCcw, X, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { NeoButton } from './ui/NeoButton';
import { NeoInput } from './ui/NeoInput';
import { api } from '../services/api';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnGenerated?: (orderId: string, returnCode: string) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  onReturnGenerated,
}) => {
  const [orderNumber, setOrderNumber] = useState<string>('ORD-1001');
  const [reason, setReason] = useState<string>('Item no longer needed');
  const [eligibility, setEligibility] = useState<any>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [returnResult, setReturnResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setChecking(true);
    setError('');
    setEligibility(null);
    setReturnResult(null);

    try {
      const res = await api.checkReturnEligibility(orderNumber.trim());
      setEligibility(res);
    } catch (err: any) {
      setError(err.message || 'Failed to check order');
    } finally {
      setChecking(false);
    }
  };

  const handleCreateReturn = async () => {
    if (!orderNumber || !reason) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await api.submitReturnRequest({
        order_number: orderNumber,
        reason,
        item_details: 'Standard Return Request',
      });
      setReturnResult(res);
      if (onReturnGenerated) {
        onReturnGenerated(orderNumber, res.return_number);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] border-[4px] border-[#171717] rounded-[6px] shadow-[8px_8px_0_#171717] w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white border-[2px] border-[#171717] rounded-[2px] shadow-[2px_2px_0_#171717] flex items-center justify-center font-black hover:bg-stone-100"
        >
          <X className="w-5 h-5 text-[#171717]" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#B8F56A] border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-[#171717]" />
          </div>
          <div>
            <h3 className="text-xl font-black">RETURN AN ITEM</h3>
            <p className="text-xs font-bold text-stone-600">30-day money-back guarantee processor</p>
          </div>
        </div>

        {returnResult ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#B8F56A] border-[3px] border-[#171717] rounded-full mx-auto flex items-center justify-center shadow-[4px_4px_0_#171717]">
              <CheckCircle className="w-10 h-10 text-[#171717]" />
            </div>
            <h4 className="text-2xl font-black">RETURN APPROVED!</h4>
            <div className="p-4 bg-white border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] text-left space-y-2 text-sm font-bold">
              <div className="flex justify-between border-b pb-1">
                <span>Return Number:</span>
                <span className="font-mono text-[#4D7CFE] font-black">{returnResult.return_number}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Prepaid Return Tracking:</span>
                <span className="font-mono">{returnResult.tracking_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Refund Amount:</span>
                <span className="text-green-700 font-black">${returnResult.refund_amount.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-stone-600 font-bold">
              A prepaid shipping label has been dispatched to your email. Pack the item and drop it off at any courier hub.
            </p>
            <NeoButton variant="yellow" fullWidth onClick={onClose}>
              DONE
            </NeoButton>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleCheckEligibility} className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <NeoInput
                    label="ENTER ORDER ID"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. ORD-1001"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <NeoButton type="submit" variant="yellow" disabled={checking}>
                    {checking ? 'CHECKING...' : 'CHECK'}
                  </NeoButton>
                </div>
              </div>

              {/* Quick Order Picker */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                <span>Test orders:</span>
                <button
                  type="button"
                  onClick={() => setOrderNumber('ORD-1001')}
                  className="px-2 py-0.5 bg-white border border-[#171717] rounded hover:bg-stone-100"
                >
                  ORD-1001 (Eligible)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderNumber('ORD-1004')}
                  className="px-2 py-0.5 bg-white border border-[#171717] rounded hover:bg-stone-100"
                >
                  ORD-1004 (Expired)
                </button>
              </div>
            </form>

            {error && (
              <div className="p-3 bg-[#FF6B6B] text-white font-bold text-xs border-[2px] border-[#171717] rounded-[3px] shadow-[2px_2px_0_#171717]">
                {error}
              </div>
            )}

            {eligibility && (
              <div
                className={`p-4 border-[3px] border-[#171717] rounded-[4px] shadow-[4px_4px_0_#171717] ${
                  eligibility.eligible ? 'bg-[#B8F56A]' : 'bg-[#FFF0F0]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {eligibility.eligible ? (
                    <CheckCircle className="w-6 h-6 text-[#171717] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-[#FF6B6B] shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h5 className="font-black text-sm uppercase">
                      {eligibility.eligible ? 'ELIGIBLE FOR RETURN & REFUND' : 'RETURN NOT PERMITTED'}
                    </h5>
                    <p className="text-xs font-bold text-stone-800">
                      {eligibility.reason}
                    </p>
                    {eligibility.eligible && (
                      <p className="text-xs font-black text-stone-900 mt-1">
                        Refund Amount: ${eligibility.total_amount?.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {eligibility.eligible && (
                  <div className="mt-4 pt-3 border-t-[2px] border-[#171717] space-y-3">
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">
                        REASON FOR RETURN:
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2.5 bg-white border-[2px] border-[#171717] rounded-[3px] font-bold text-xs focus:outline-none"
                      >
                        <option value="Item no longer needed">Item no longer needed</option>
                        <option value="Ordered wrong switch / size">Ordered wrong switch / size</option>
                        <option value="Defective or damaged">Defective or damaged</option>
                        <option value="Performance not as expected">Performance not as expected</option>
                      </select>
                    </div>

                    <NeoButton
                      type="button"
                      variant="dark"
                      size="md"
                      fullWidth
                      onClick={handleCreateReturn}
                      disabled={submitting}
                    >
                      {submitting ? 'GENERATING RETURN...' : 'GENERATE RETURN LABEL & CONFIRM'}
                      <ArrowRight className="w-4 h-4" />
                    </NeoButton>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
