
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

export const CookieBanner: React.FC = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-[slideUp_0.5s_ease-out]">
      <div className="max-w-4xl mx-auto bg-[#0f172a]/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex h-12 w-12 bg-indigo-500/20 rounded-full items-center justify-center flex-shrink-0">
             <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {t('cookie_message')}
            <a href="#" className="text-indigo-400 hover:text-indigo-300 ml-1 underline">{t('privacy')}</a>
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleDecline}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-600 text-slate-400 text-sm hover:bg-slate-800 transition-colors"
          >
            {t('cookie_decline')}
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-900/30 transition-all active:scale-95"
          >
            {t('cookie_accept')}
          </button>
        </div>
      </div>
    </div>
  );
};
