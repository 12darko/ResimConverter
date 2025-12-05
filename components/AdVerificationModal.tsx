import React, { useEffect, useState } from 'react';

interface AdVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void;
}

export const AdVerificationModal: React.FC<AdVerificationModalProps> = ({ isOpen, onClose, onReward }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5);
      setCanClose(false);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleRewardClaim = () => {
    onReward();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      
      <div className="relative bg-[#0B0F19] border border-slate-700 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
        <div className="mb-6">
          <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
             {timeLeft > 0 ? (
               <span className="text-2xl font-bold text-white">{timeLeft}</span>
             ) : (
               <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
             )}
             {/* Progress ring simulation */}
             <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Sponsorlu İçerik</h3>
          <p className="text-slate-400 text-sm">
            Lütfen ödülünüzü kazanmak için videonun bitmesini bekleyin.
          </p>
        </div>

        {/* Mock Ad Content Area */}
        <div className="w-full h-32 bg-slate-800 rounded-lg mb-6 flex items-center justify-center border border-slate-700 border-dashed">
            <span className="text-xs text-slate-500 font-mono animate-pulse">REKLAM OYNATILIYOR...</span>
        </div>

        <button
          onClick={handleRewardClaim}
          disabled={!canClose}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            canClose 
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 active:scale-95' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {canClose ? 'Ödülü Al (+1 Hak)' : `${timeLeft} saniye bekleyin`}
        </button>
        
        {/* Anti-cheat close button */}
        <button onClick={onClose} className="mt-4 text-xs text-slate-600 hover:text-white underline">
          Kapat (Ödül Yok)
        </button>
      </div>
    </div>
  );
};