
import React from 'react';
import { useLanguage } from '../LanguageContext';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-[#0f172a] border border-amber-500/30 rounded-2xl max-w-lg w-full p-8 shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        
        {/* Decorative ambient lights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-amber-500/20 to-transparent border border-amber-500/20 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 7.75a1 1 0 01.554 1.705l-2.427 2.365.573 3.343a1 1 0 01-1.451 1.054L11 14.25l-2.997 1.576a1 1 0 01-1.451-1.054l.573-3.343-2.427-2.365a1 1 0 01.554-1.705l3.354-.55L11.034 2.744A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{t('prem_title')}</h2>
          <p className="text-slate-400 text-sm mb-8">{t('prem_subtitle')}</p>
        </div>

        <div className="space-y-4 mb-8">
          {[
            t('prem_feature_1'),
            t('prem_feature_2'),
            t('prem_feature_3'),
            t('prem_feature_4'),
          ].map((item, idx) => (
            <div key={idx} className="flex items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={onUpgrade}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98]"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full skew-x-12 group-hover:animate-[shimmer_1s_infinite]"></div>
          <span className="relative z-10">{t('prem_price_btn')}</span>
        </button>
        
        <button 
          onClick={onClose}
          className="w-full mt-4 text-slate-500 hover:text-white py-2 text-sm transition-colors font-medium"
        >
          {t('prem_no_thanks')}
        </button>
      </div>
    </div>
  );
};
