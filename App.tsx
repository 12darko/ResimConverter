import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dropzone } from './components/Dropzone';
import { AdBanner } from './components/AdBanner';
import { PremiumModal } from './components/PremiumModal';
import { ReferralWidget } from './components/ReferralWidget';
import { PaymentModal } from './components/PaymentModal';
import { LegalModal } from './components/LegalModal';
import { CookieBanner } from './components/CookieBanner';
import { AdVerificationModal } from './components/AdVerificationModal';
import { AuthModal } from './components/AuthModal'; // Auth import
import { generateAiFilename } from './services/geminiService';
import { supabase, getUserProfile, updateUserCredits, upgradeToPremium } from './services/supabase'; // DB Services
import { LanguageProvider, useLanguage } from './LanguageContext';
import { 
  FileItem, 
  ConversionFormat, 
  UserStats, 
  MAX_FREE_CREDITS, 
  COST_PER_CONVERT, 
  COST_PER_AI_RENAME,
  ENABLE_PREMIUM_SYSTEM
} from './types';

declare global {
  interface Window {
    heic2any: (options: { blob: Blob; toType: string; quality?: number }) => Promise<Blob | Blob[]>;
  }
}

function BanaConvertApp() {
  const { t, language, setLanguage } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  
  // Auth & User State
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({
    credits: MAX_FREE_CREDITS,
    isPremium: false,
    lastResetDate: new Date().toISOString().split('T')[0]
  });
  
  // Modals
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Auth Modal
  
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'contact'>('privacy');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 1. Initialize Session & Stats
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        // Fallback to local storage for guests
        loadLocalStats();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        loadLocalStats();
      }
    });

    // Scroll listener
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadLocalStats = () => {
    const storedStats = localStorage.getItem('vormPixyzeStats');
    if (storedStats) {
      const parsed: UserStats = JSON.parse(storedStats);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastResetDate !== today && !parsed.isPremium) {
        setStats({ ...parsed, credits: MAX_FREE_CREDITS, lastResetDate: today });
      } else {
        setStats(parsed);
      }
    }
  };

  const loadUserProfile = async (userId: string) => {
    const profile = await getUserProfile(userId);
    if (profile) {
      setStats(profile);
    }
  };

  // Sync Local changes to DB or Storage
  useEffect(() => {
    if (!session) {
      localStorage.setItem('vormPixyzeStats', JSON.stringify(stats));
    }
    // Note: DB updates happen explicitly via updateCredits calls, not useEffect sync to avoid loops
  }, [stats, session]);

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const tempFiles: FileItem[] = newFiles.map(file => ({
      id: uuidv4(),
      file,
      previewUrl: '',
      targetFormat: ConversionFormat.JPEG,
      quality: 0.9,
      rotation: 0,
      resizeScale: 1,
      isGrayscale: false,
      removeBackground: false,
      bgRemovalTolerance: 30,
      status: 'analyzing',
      errorMsg: ''
    }));

    setFiles(prev => [...prev, ...tempFiles]);

    // Process previews sequentially to avoid memory spikes with HEIC
    for (const item of tempFiles) {
      try {
        let finalUrl = '';
        const lowerName = item.file.name.toLowerCase();
        const isHeic = lowerName.endsWith('.heic') || lowerName.endsWith('.heif');

        if (isHeic) {
           if (window.heic2any) {
             const convertedBlob = await window.heic2any({ blob: item.file, toType: 'image/jpeg', quality: 0.6 }); // Use lower quality for preview speed
             const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
             finalUrl = URL.createObjectURL(blobToUse);
           } else {
             throw new Error("HEIC converter library missing");
           }
        } else {
           finalUrl = URL.createObjectURL(item.file);
        }

        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, previewUrl: finalUrl, status: 'idle' } : f));
      } catch (error) {
        console.error("Preview generation error:", error);
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', errorMsg: 'Format desteklenmiyor' } : f));
      }
    }
  }, []);

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));
  const updateFileConfig = (id: string, key: keyof FileItem, value: any) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  // --- ACTIONS ---

  const handleUpgradeClick = () => {
    if (!session) {
      setIsAuthModalOpen(true); // Require login for premium
      return;
    }
    setIsPremiumModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setStats(prev => ({ ...prev, isPremium: true, credits: 99999 }));
    if (session) {
      await upgradeToPremium(session.user.id);
    }
  };

  const handleReward = async (amount: number) => {
    const newCredits = stats.credits + amount;
    setStats(prev => ({ ...prev, credits: newCredits }));
    if (session) {
      await updateUserCredits(session.user.id, newCredits);
    }
  };
  
  const handleWatchAdReward = () => {
    handleReward(1);
    setIsAdModalOpen(false);
  };

  const openLegal = (tab: 'privacy' | 'terms' | 'contact') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deductCredit = async (cost: number) => {
    if (stats.isPremium) return true;
    if (stats.credits < cost) return false;
    
    const newCredits = stats.credits - cost;
    setStats(prev => ({ ...prev, credits: newCredits }));
    
    if (session) {
      await updateUserCredits(session.user.id, newCredits);
    }
    return true;
  };

  // --- ROBUST CONVERSION ENGINE ---
  const convertImage = async (id: string) => {
    const item = files.find(f => f.id === id);
    if (!item) return;

    if (!(await deductCredit(COST_PER_CONVERT))) {
      if (ENABLE_PREMIUM_SYSTEM) setIsPremiumModalOpen(true);
      else alert(t('drop_limit'));
      return;
    }

    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'converting' } : f));

    // Allow UI to update before heavy processing
    setTimeout(async () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.previewUrl;
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) throw new Error("Canvas context failed");

        // High Quality Settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let targetWidth = Math.floor(img.width * item.resizeScale);
        let targetHeight = Math.floor(img.height * item.resizeScale);

        // Handle Rotation Logic
        if (item.rotation === 90 || item.rotation === 270) {
          canvas.width = targetHeight;
          canvas.height = targetWidth;
        } else {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
        }

        // Apply Transforms
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

        // PIXEL PROCESSING (Grayscale & BG Removal)
        if (item.isGrayscale || (item.removeBackground && item.targetFormat !== ConversionFormat.JPEG)) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const len = data.length;
          const bgTolerance = item.bgRemovalTolerance || 30;
          
          // Euclidean distance threshold for white/light background
          // Optimized for loop
          const threshold = bgTolerance * 4.4; 

          for (let i = 0; i < len; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Grayscale Filter
            if (item.isGrayscale) {
              const gray = (r * 0.299) + (g * 0.587) + (b * 0.114);
              data[i] = gray;
              data[i + 1] = gray;
              data[i + 2] = gray;
            }

            // Simple Magic Eraser (White/Light BG Removal)
            if (item.removeBackground && item.targetFormat !== ConversionFormat.JPEG) {
              // Calculate distance from white (255, 255, 255)
              const dist = Math.sqrt(
                (255 - r) * (255 - r) + 
                (255 - g) * (255 - g) + 
                (255 - b) * (255 - b)
              );

              if (dist < threshold) {
                data[i + 3] = 0; // Transparent
              } else if (dist < threshold + 20) {
                // Feathering for smooth edges
                const alpha = (dist - threshold) / 20;
                data[i + 3] = Math.floor(255 * alpha);
              }
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }

        const dataUrl = canvas.toDataURL(item.targetFormat, item.quality);
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        setFiles(prev => prev.map(f => f.id === id ? { 
          ...f, status: 'done', convertedUrl: dataUrl, convertedBlob: blob, convertedSize: blob.size
        } : f));

      } catch (err) {
        console.error("Conversion Error:", err);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', errorMsg: t('error_generic') } : f));
      }
    }, 100);
  };

  const handleAiRename = async (id: string) => {
    const item = files.find(f => f.id === id);
    if (!item) return;

    if (!(await deductCredit(COST_PER_AI_RENAME))) {
      if (ENABLE_PREMIUM_SYSTEM) setIsPremiumModalOpen(true);
      else alert(t('drop_limit'));
      return;
    }

    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'analyzing' } : f));

    try {
      const newName = await generateAiFilename(item.file);
      if (newName) {
         setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'idle', aiName: newName } : f));
      } else {
        throw new Error("AI failed");
      }
    } catch (err) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', errorMsg: 'AI Busy' } : f));
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-200 flex flex-col">
      {/* Modals */}
      {ENABLE_PREMIUM_SYSTEM && (
        <>
          <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} onUpgrade={handleUpgradeClick} />
          <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={handlePaymentSuccess} />
        </>
      )}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={() => {}} />
      <AdVerificationModal isOpen={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} onReward={handleWatchAdReward} />
      <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} initialTab={legalModalTab} />
      <CookieBanner />

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => window.location.reload()}>
              <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-30 group-hover:opacity-60 transition-opacity"></div>
              <svg className="relative w-10 h-10 drop-shadow-xl" viewBox="0 0 100 100" fill="none">
                <defs><linearGradient id="logoGrad" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
                <path d="M20 15 L40 75 L50 90 L60 75 L80 15 L65 15 L50 60 L35 15 Z" fill="url(#logoGrad)" />
                <rect x="45" y="5" width="10" height="10" fill="#facc15" className="animate-bounce" style={{animationDuration: '2s'}} />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white hidden sm:block">
              Vorm<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Pixyze</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
               <button onClick={() => setLanguage('tr')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'tr' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>TR</button>
               <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>EN</button>
            </div>

            {session ? (
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                  {stats.isPremium ? 'Premium' : session.user.email?.split('@')[0]}
                </span>
                <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full ${stats.credits > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                   <span className="font-mono text-white font-bold text-lg">{stats.isPremium ? '∞' : stats.credits}</span>
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-end mr-2">
                 <button onClick={() => setIsAuthModalOpen(true)} className="text-xs text-indigo-400 hover:text-white underline">
                    {t('daily_credits')}: {stats.credits} (Giriş Yap)
                 </button>
               </div>
            )}

            {/* Logout or Premium Button */}
            {session ? (
              <button onClick={() => supabase.auth.signOut()} className="text-xs text-slate-500 hover:text-white">Çıkış</button>
            ) : null}

            {ENABLE_PREMIUM_SYSTEM && !stats.isPremium && (
              <button 
                onClick={() => setIsPremiumModalOpen(true)}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg text-white font-bold text-sm shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] skew-x-12 group-hover:animate-[shimmer_1s_infinite]"></div>
                <span className="relative z-10">{t('premium_btn')}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 mt-6 flex-grow">
        
        {/* Left: Upload & Files */}
        <div className="flex-1 flex flex-col gap-8">
          <section className="glass-panel rounded-2xl p-1 shadow-2xl animate-[fadeIn_0.5s]">
            <Dropzone 
              onFilesAdded={handleFilesAdded} 
              disabled={!stats.isPremium && stats.credits <= 0 && files.length === 0} 
            />
          </section>

          <div className="space-y-4">
            {files.length > 0 && (
               <div className="flex items-center justify-between mb-2 px-2">
                  <h3 className="text-lg font-semibold text-white">{t('queue')} ({files.length})</h3>
                  <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300">{t('clear_all')}</button>
               </div>
            )}
            
            {files.map(file => (
              <div key={file.id} className="bg-[#151f32] border border-slate-700/50 rounded-xl p-5 relative">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="relative w-full lg:w-48 h-48 bg-[#0B0F19] rounded-lg border border-slate-700/50 flex items-center justify-center">
                    {file.status === 'analyzing' && !file.previewUrl ? (
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <img src={file.status === 'done' ? file.convertedUrl : file.previewUrl} className={`max-w-full max-h-full object-contain ${file.isGrayscale ? 'grayscale' : ''}`} style={{ transform: `rotate(${file.rotation}deg)` }} />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-200 truncate max-w-xs">{file.file.name}</h4>
                        <button onClick={() => removeFile(file.id)} className="text-slate-600 hover:text-red-400">✕</button>
                      </div>

                      <div className="mb-4">
                        {file.aiName ? (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-xs text-emerald-100 font-mono">
                            AI: {file.aiName}
                          </div>
                        ) : (
                          <button onClick={() => handleAiRename(file.id)} disabled={file.status !== 'idle'} className="text-xs text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20">
                            {file.status === 'analyzing' ? t('ai_rename_loading') : t('ai_rename_btn')}
                          </button>
                        )}
                      </div>
                    </div>

                    {file.status !== 'done' && (
                      <div className="bg-slate-900/60 p-4 rounded-lg space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {[ConversionFormat.JPEG, ConversionFormat.PNG, ConversionFormat.WEBP].map(fmt => (
                            <button key={fmt} onClick={() => updateFileConfig(file.id, 'targetFormat', fmt)} className={`text-xs px-3 py-1.5 rounded border ${file.targetFormat === fmt ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-600'}`}>
                              {fmt.split('/')[1].toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <button onClick={() => updateFileConfig(file.id, 'rotation', (file.rotation + 90) % 360)} className="bg-slate-800 p-2 rounded text-xs border border-slate-700">{t('rotate')}: {file.rotation}°</button>
                            <button onClick={() => updateFileConfig(file.id, 'isGrayscale', !file.isGrayscale)} className={`p-2 rounded text-xs border ${file.isGrayscale ? 'bg-slate-600' : 'bg-slate-800'}`}>{t('grayscale')}</button>
                            <select onChange={(e) => updateFileConfig(file.id, 'resizeScale', parseFloat(e.target.value))} className="bg-slate-800 text-xs border border-slate-700 rounded p-2">
                              <option value="1">100%</option><option value="0.75">75%</option><option value="0.5">50%</option><option value="0.25">25%</option>
                            </select>
                        </div>
                        {file.targetFormat !== ConversionFormat.JPEG && (
                          <div className="flex items-center gap-2">
                             <button onClick={() => updateFileConfig(file.id, 'removeBackground', !file.removeBackground)} className={`text-xs p-1 rounded ${file.removeBackground ? 'text-pink-400' : 'text-slate-500'}`}>Remove BG</button>
                             {file.removeBackground && <input type="range" min="0" max="80" value={file.bgRemovalTolerance} onChange={(e) => updateFileConfig(file.id, 'bgRemovalTolerance', parseInt(e.target.value))} className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex justify-end gap-3">
                       {file.status === 'idle' && (
                         <button onClick={() => convertImage(file.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/30">
                           {t('convert_btn')}
                         </button>
                       )}
                       {file.status === 'done' && (
                         <a href={file.convertedUrl} download={`${file.aiName || file.file.name.split('.')[0]}.${file.targetFormat.split('/')[1]}`} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                           {t('download_btn')} ({formatFileSize(file.convertedSize || 0)})
                         </a>
                       )}
                    </div>
                  </div>
                </div>
                {file.status === 'converting' && <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex items-center justify-center z-20 text-indigo-300 text-xs flex-col gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  {t('processing')}
                </div>}
              </div>
            ))}
            
            {files.length > 0 && <div className="mt-8"><AdBanner variant="horizontal" /></div>}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl border border-white/5">
            <h4 className="text-indigo-400 font-bold mb-4">{t('pro_tips_title')}</h4>
            <ul className="text-sm text-slate-400 space-y-3">
              <li>• {t('tip_heic')}</li>
              <li>• {t('tip_seo')}</li>
              <li>• {t('tip_size')}</li>
            </ul>
          </div>

          <div className="sticky top-24 space-y-6">
            {!stats.isPremium && <ReferralWidget onReferralSuccess={() => handleReward(3)} />}
            {!stats.isPremium && !ENABLE_PREMIUM_SYSTEM && <AdBanner onWatchAd={() => setIsAdModalOpen(true)} className="w-full" />}
            <AdBanner variant="vertical" className="hidden lg:flex" />
          </div>
        </div>
      </main>
      
      {showScrollTop && <button onClick={scrollToTop} className="fixed bottom-24 right-6 z-40 p-3 rounded-full bg-indigo-600/80 text-white shadow-lg">↑</button>}
      
      <footer className="mt-20 border-t border-slate-800 bg-[#0B0F19] py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-bold text-lg text-white">VormPixyze</span>
          <div className="flex gap-6 text-sm text-slate-500">
            <button onClick={() => openLegal('privacy')} className="hover:text-indigo-400">{t('privacy')}</button>
            <button onClick={() => openLegal('terms')} className="hover:text-indigo-400">{t('terms')}</button>
            <button onClick={() => openLegal('contact')} className="hover:text-indigo-400">{t('contact')}</button>
          </div>
          <div className="text-slate-600 text-xs font-mono">&copy; 2024 VormPixyze Inc.</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BanaConvertApp />
    </LanguageProvider>
  );
}