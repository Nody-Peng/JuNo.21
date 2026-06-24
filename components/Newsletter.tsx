"use client"
import { useState } from 'react';
import ScrollReveal from './ScrollReveal';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('請填寫 Email');
      return;
    }
    if (!agreed) {
      setStatus('error');
      setMessage('請勾選同意接收電子報');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok || res.status === 200) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
        setAgreed(false);
      } else {
        setStatus('error');
        setMessage(data.error || '訂閱失敗，請稍後再試');
      }
    } catch {
      setStatus('error');
      setMessage('網路錯誤，請稍後再試');
    }
  };

  return (
    <section id="subscribe" className="w-full relative py-24 md:py-32 bg-stone-200 border-t border-[#3B2D2A]/10 overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img src="/subscribe.jpeg" alt="Interior" className="w-full h-full object-cover opacity-90" />
      </div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col">
        
        <ScrollReveal direction="up">
          <h2 className="text-5xl md:text-[7rem] font-serif text-[#3B2D2A] tracking-widest mb-8 md:mb-12 drop-shadow-sm mix-blend-color-burn">
            訂閱電子報
          </h2>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200}>
          <div className="bg-[#F9F8F6] p-8 md:p-12 w-full max-w-[500px] shadow-2xl rounded-sm">
            
            {status === 'success' ? (
              // Success state
              <div className="text-center py-4">
                <div className="text-5xl mb-4">🌿</div>
                <p className="font-serif text-xl text-[#3B2D2A] mb-3 leading-relaxed">{message}</p>
                <p className="text-stone-500 text-sm">
                  下次電子報寄出時，我們會第一個通知你。
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-sm text-[#3B2D2A]/60 underline underline-offset-4 hover:text-[#3B2D2A] transition-colors"
                >
                  再訂閱一個地址
                </button>
              </div>
            ) : (
              // Form
              <>
                <p className="font-serif text-xl md:text-2xl text-[#3B2D2A] mb-8 leading-relaxed tracking-wide">
                  每月一封信：最新文章與選物推薦！
                </p>
                <form className="flex flex-col gap-6 font-sans" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-semibold text-[#3B2D2A] mb-2 tracking-widest">
                      電子信箱 *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="請輸入你的 Email"
                      className="w-full border-b border-[#3B2D2A]/30 bg-transparent py-3 text-[#3B2D2A] focus:outline-none focus:border-[#3B2D2A] transition-colors"
                      disabled={status === 'loading'}
                    />
                  </div>

                  <div className="flex items-start gap-3 mt-2">
                    <input
                      type="checkbox"
                      id="newsletter-agree"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[#3B2D2A]"
                      disabled={status === 'loading'}
                    />
                    <label htmlFor="newsletter-agree" className="text-sm text-[#3B2D2A]/80 font-medium leading-relaxed">
                      是的，我願意接收《夏至原點》的最新資訊與電子報。可隨時退訂。*
                    </label>
                  </div>

                  {/* Error message */}
                  {status === 'error' && message && (
                    <p className="text-red-600 text-sm">{message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-[#3B2D2A] text-white py-4 font-medium tracking-widest hover:bg-[#2a1f1d] transition-colors mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? '訂閱中...' : '送出訂閱'}
                  </button>
                </form>
              </>
            )}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
