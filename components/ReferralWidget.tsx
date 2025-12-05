
import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';

interface ReferralWidgetProps {
  onReferralSuccess: () => void;
}

export const ReferralWidget: React.FC<ReferralWidgetProps> = ({ onReferralSuccess }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    // Simüle edilmiş paylaşım linki
    const referralLink = `https://banaconvert.com/?ref=${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(referralLink);
    
    setCopied(true);
    onReferralSuccess(); // Kredi ver

    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-xl p-6 text-center shadow-lg">
      
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
           <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
           </svg>
        </div>

        <h3 className="text-white font-bold text-lg mb-1">{t('ref_title')}</h3>
        <p className="text-slate-400 text-xs mb-4 leading-relaxed">
          {t('ref_desc')}
        </p>

        <button 
          onClick={handleCopyLink}
          className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            copied 
              ? 'bg-green-500 text-white shadow-green-500/20' 
              : 'bg-white text-indigo-900 hover:bg-slate-200 shadow-white/10'
          } shadow-lg`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {t('ref_success')}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              {t('ref_btn')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
