import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // --- ÖDEME ENTEGRASYON BÖLÜMÜ (BACKEND GEREKTİRİR) ---
    // Gerçek dünyada burada backend sunucuna istek atmalısın.
    // Frontend'de gizli API key saklanmaz.
    
    try {
      /* 
      ÖRNEK IYZICO/STRIPE AKIŞI:
      
      1. Backend'e istek at:
      const response = await fetch('https://senin-sunucun.com/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'premium_monthly' })
      });
      
      2. Gelen linke yönlendir veya Iyzico pop-up aç:
      const data = await response.json();
      
      Eğer Iyzico Formu ise:
      window.location.href = data.paymentPageUrl;
      
      Eğer Stripe ise:
      stripe.redirectToCheckout({ sessionId: data.id });
      */

      // ŞİMDİLİK SİMÜLASYON (DEMO AMAÇLI):
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
      
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setTimeout(() => setStep('form'), 500);
      }, 1500);

    } catch (error) {
      console.error("Ödeme hatası:", error);
      setStep('form'); // Hata olursa başa dön
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-bold text-white">Güvenli Ödeme (Demo)</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-indigo-300 flex justify-between font-medium">
                  <span>Premium Üyelik (Aylık)</span>
                  <span>₺29.99</span>
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Kart Üzerindeki İsim</label>
                <input required type="text" placeholder="Ad Soyad" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Kart Numarası</label>
                <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase text-slate-500 font-bold mb-1">SKT</label>
                  <input required type="text" placeholder="MM/YY" maxLength={5} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs uppercase text-slate-500 font-bold mb-1">CVC</label>
                  <input required type="text" placeholder="123" maxLength={3} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono" />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-4 transition-all shadow-lg shadow-indigo-500/25 active:scale-95">
                Ödemeyi Tamamla (₺29.99)
              </button>
              
              <p className="text-[10px] text-center text-slate-600 mt-2">
                Bu bir demo ödeme ekranıdır. Kartınızdan çekim yapılmaz.
              </p>
            </form>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-300 font-medium">Banka ile iletişim kuruluyor...</p>
               <p className="text-xs text-slate-500">Lütfen pencereyi kapatmayın.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-[fadeIn_0.5s]">
               <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
               </div>
               <h3 className="text-xl font-bold text-white">Ödeme Başarılı!</h3>
               <p className="text-slate-400 text-center text-sm">Premium özellikler hesabınıza tanımlandı. İyi günlerde kullanın.</p>
            </div>
          )}
        </div>
        
        <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex justify-center gap-2 text-slate-600">
           {/* Mock Card Icons */}
           <div className="h-6 w-10 bg-slate-800 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
           <div className="h-6 w-10 bg-slate-800 rounded flex items-center justify-center text-[8px] font-bold">MASTER</div>
           <div className="h-6 w-10 bg-slate-800 rounded flex items-center justify-center text-[8px] font-bold">TROY</div>
        </div>
      </div>
    </div>
  );
};