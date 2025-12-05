
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'privacy' | 'terms' | 'contact';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if(isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header with Tabs */}
        <div className="flex flex-col sm:flex-row border-b border-slate-700 bg-slate-900/50 p-2 sm:p-4 justify-between items-center rounded-t-2xl gap-3">
          <div className="flex w-full sm:w-auto bg-slate-800/50 p-1 rounded-lg gap-1">
            {(['privacy', 'terms', 'contact'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {t(tab)}
              </button>
            ))}
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 sm:static w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-slate-300 text-sm leading-relaxed space-y-4 custom-scrollbar">
           <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sticky top-0 bg-[#0f172a]/95 py-2 backdrop-blur-sm z-10">
             {t(`${activeTab}_title`)}
           </h3>
           <div className="whitespace-pre-wrap font-sans text-slate-400">
             {t(`${activeTab}_content`)}
           </div>
           
           {/* Trust Badges for Contact Tab */}
           {activeTab === 'contact' && (
             <div className="mt-8 pt-8 border-t border-slate-800 flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="h-8 bg-slate-800 rounded px-2 flex items-center text-xs font-bold">SSL SECURE</div>
                <div className="h-8 bg-slate-800 rounded px-2 flex items-center text-xs font-bold">DMCA PROTECTED</div>
             </div>
           )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
