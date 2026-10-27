import React, { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { NeoButton } from './ui/NeoButton';
import { api } from '../services/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: number | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  conversationId,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isResolved, setIsResolved] = useState<boolean>(true);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitFeedback({
        conversation_id: conversationId,
        rating,
        comment,
        resolved_satisfactorily: isResolved,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setComment('');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] border-[4px] border-[#171717] rounded-[6px] shadow-[8px_8px_0_#171717] w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white border-[2px] border-[#171717] rounded-[2px] shadow-[2px_2px_0_#171717] flex items-center justify-center font-black hover:bg-stone-100"
        >
          <X className="w-5 h-5 text-[#171717]" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-[#B8F56A] mx-auto filter drop-shadow-[2px_2px_0_#171717]" />
            <h3 className="text-2xl font-black">THANK YOU!</h3>
            <p className="text-sm font-bold text-stone-700">
              Your feedback fuels our coffee and algorithm refinement.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-black uppercase tracking-wider bg-[#FFE156] border-[2px] border-[#171717] px-2 py-0.5 rounded-[2px] shadow-[2px_2px_0_#171717]">
                RESOLUTION CHECK
              </span>
              <h3 className="text-xl font-black mt-2">
                Did we get that sorted, or should I keep my detective hat on? 🕵️
              </h3>
            </div>

            {/* Satisfied Toggle */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResolved(true)}
                className={`py-2 px-3 text-xs font-black uppercase border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] transition-all ${
                  isResolved ? 'bg-[#B8F56A] translate-x-[1px] translate-y-[1px]' : 'bg-white hover:bg-stone-50'
                }`}
              >
                ✅ All Sorted!
              </button>
              <button
                type="button"
                onClick={() => setIsResolved(false)}
                className={`py-2 px-3 text-xs font-black uppercase border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] transition-all ${
                  !isResolved ? 'bg-[#FF6B6B] text-white translate-x-[1px] translate-y-[1px]' : 'bg-white hover:bg-stone-50'
                }`}
              >
                ❌ Need More Help
              </button>
            </div>

            {/* Star Rating */}
            <div className="py-2 text-center">
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                RATE YOUR EXPERIENCE:
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-[#FFE156] text-[#171717]'
                          : 'text-stone-300'
                      }`}
                      strokeWidth={2.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                ADDITIONAL COMMENTS:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Tell us what worked or where we can do better..."
                className="w-full p-3 bg-white border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] font-medium text-sm focus:outline-none focus:shadow-[5px_5px_0_#171717]"
              />
            </div>

            <NeoButton
              type="submit"
              variant="yellow"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? 'RECORDING FEEDBACK...' : 'SUBMIT FEEDBACK'}
            </NeoButton>
          </form>
        )}
      </div>
    </div>
  );
};
