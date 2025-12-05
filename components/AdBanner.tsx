import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'box';
  onWatchAd?: () => void;
  // Google AdSense Props
  adClient?: string; // ca-pub-XXXXXXXXXXXXXXXX
  adSlot?: string;   // 1234567890
  adFormat?: 'auto' | 'fluid' | 'rectangle';
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  className = '', 
  variant = 'horizontal', 
  onWatchAd,
  adClient = 'ca-pub-XXXXXXXXXXXXXXXX', // Default placeholder
  adSlot = '1234567890', // Default placeholder
  adFormat = 'auto'
}) => {
  const adRef = useRef<HTMLModElement>(null);

  const sizeClasses = {
    horizontal: 'h-28 w-full',
    vertical: 'w-full h-[600px]',
    box: 'w-full h-[250px]'
  };

  useEffect(() => {
    // Sadece "Real Ad" modundaysak (yani onWatchAd yoksa) reklamı yükle
    if (!onWatchAd) {
      const loadAd = () => {
        if (adRef.current) {
          try {
            // HATA DÜZELTME: Görünürlük Kontrolü
            // Eğer element gizliyse (display: none), offsetParent null döner.
            // Bu durumda reklamı yüklemeye çalışmak 'No slot size' hatası verir.
            if (adRef.current.offsetParent === null) {
              return;
            }

            const adsbygoogle = (window as any).adsbygoogle || [];
            
            // Reklamın daha önce yüklenip yüklenmediğini kontrol et
            // data-adsbygoogle-status özelliği AdSense tarafından eklenir
            if (!adRef.current.getAttribute('data-adsbygoogle-status') && adRef.current.innerHTML === "") {
               adsbygoogle.push({});
            }
          } catch (e) {
            console.error("AdSense error:", e);
          }
        }
      };

      // Layout'un tam oturması için kısa bir gecikme (zamanlama hatasını önler)
      const timer = setTimeout(loadAd, 300);
      return () => clearTimeout(timer);
    }
  }, [onWatchAd]);

  // MODE 1: REWARDED AD (Simülasyon - +1 Hak Kazandıran Buton)
  if (onWatchAd) {
    return (
      <div className={`relative group overflow-hidden bg-slate-900 border border-slate-700/50 rounded-xl flex flex-col items-center justify-center text-center p-6 shadow-lg ${className}`}>
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-50"></div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        
        <div className="absolute top-2 right-2 flex gap-1">
          <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-slate-500 font-bold tracking-wider border border-slate-700">SPONSOR</span>
        </div>

        <div className="z-10 flex flex-col items-center w-full">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3 text-indigo-400">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <p className="text-slate-300 font-bold text-sm mb-1">Ücretsiz Hak Kazan</p>
          <p className="text-slate-500 text-xs mb-4">Kısa bir reklam izleyerek dönüştürme hakkı kazan.</p>
          
          <button 
            onClick={onWatchAd}
            className="w-full group/btn relative overflow-hidden rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Reklamı İzle (+1)
            </span>
          </button>
        </div>
      </div>
    );
  }

  // MODE 2: REAL GOOGLE ADSENSE (Display Ad)
  return (
    <div className={`relative bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center ${sizeClasses[variant]} ${className}`}>
      
      {/* Google AdSense Container */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      ></ins>

      {/* Placeholder text for Development (Visible only if ad blocked or loading) */}
      <span className="absolute text-[10px] text-slate-700 font-mono pointer-events-none z-[-1]">
        GOOGLE ADS SPACE<br/>({variant})
      </span>
    </div>
  );
};