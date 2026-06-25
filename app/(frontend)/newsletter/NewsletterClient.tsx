'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewsletterClient() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading' | null; message: string }>({
    type: null,
    message: '',
  });

  useEffect(() => {
    fetch('/api/send-newsletter')
      .then(r => r.json())
      .then(d => setSubscriberCount(d.count ?? 0))
      .catch(() => setSubscriberCount(0));
  }, []);

  const handleSend = async () => {
    if (!subject.trim() || !htmlContent.trim()) {
      setStatus({ type: 'error', message: '請填寫主旨和內容' });
      return;
    }

    const confirmed = window.confirm(
      `確定要發送電子報給 ${subscriberCount} 位訂閱者嗎？\n\n主旨：${subject}`
    );
    if (!confirmed) return;

    setStatus({ type: 'loading', message: '發送中，請稍候...' });

    try {
      const res = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, htmlContent }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message });
        setSubject('');
        setHtmlContent('');
      } else {
        setStatus({ type: 'error', message: data.error || '發送失敗' });
      }
    } catch {
      setStatus({ type: 'error', message: '網路錯誤，請稍後再試' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] relative">
      {/* ── Top Toolbar ── */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-[#3B2D2A]/5 px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => router.push('/my-posts')}
          className="flex items-center gap-2 text-[11px] font-semibold text-[#3B2D2A]/40 hover:text-[#3B2D2A] transition-colors tracking-widest uppercase"
        >
          <span className="text-lg leading-none mt-[-2px]">&larr;</span> Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={status.type === 'loading'}
            className="px-6 py-2.5 rounded-full text-[12px] font-bold tracking-widest bg-[#3B2D2A] text-[#F9F8F6] hover:bg-[#2a1f1c] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 uppercase flex items-center gap-2"
          >
            {status.type === 'loading' ? 'Sending...' : `Send to ${subscriberCount ?? '...'} Subscribers`}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-8 md:px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-[#3B2D2A] tracking-wider mb-2">發送電子報</h1>
          <p className="text-[13px] text-[#3B2D2A]/40 tracking-widest uppercase ml-1">
            Active Subscribers: <strong className="text-[#3B2D2A]/70">{subscriberCount === null ? '...' : subscriberCount}</strong>
          </p>
        </div>

        {/* Status Message */}
        {status.type && (
          <div className={`mb-8 p-4 rounded-xl text-[13px] font-medium tracking-wide flex items-start gap-3 border ${
            status.type === 'success' ? 'bg-[#E8F3E8] text-[#2D6A4F] border-[#52B788]/30' :
            status.type === 'error' ? 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]/30' :
            'bg-[#FEF9E7] text-[#78350F] border-[#F59E0B]/30'
          }`}>
            <span className="mt-0.5">{status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : '⏳'}</span>
            <div>{status.message}</div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-8">
          <div>
            <label className="block text-[11px] font-bold text-[#3B2D2A]/40 uppercase tracking-[0.2em] mb-3">
              郵件主旨 (Subject)
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="例如：夏至原點六月號 — 跨越時差的夏天"
              className="w-full bg-white/70 backdrop-blur-sm border border-black/5 rounded-2xl px-5 py-4 text-[15px] text-[#3B2D2A] font-medium outline-none focus:border-amber-400 focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all placeholder-gray-300"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#3B2D2A]/40 uppercase tracking-[0.2em] mb-1">
              郵件內容 (HTML)
            </label>
            <p className="text-[11px] text-[#3B2D2A]/30 mb-3 tracking-wider">
              支援 HTML 標籤，例如 &lt;p&gt;、&lt;h2&gt;、&lt;strong&gt;、&lt;a href="..."&gt;、&lt;img src="..."&gt; 等
            </p>
            <textarea
              value={htmlContent}
              onChange={e => setHtmlContent(e.target.value)}
              placeholder={`<p>親愛的訂閱者，</p>\n<p>這個月我們想和你分享...</p>\n<p>— 夏至原點 Juno & Morgan</p>`}
              rows={14}
              className="w-full bg-white/70 backdrop-blur-sm border border-black/5 rounded-2xl px-5 py-5 text-[13px] font-mono leading-relaxed text-[#3B2D2A]/80 outline-none focus:border-amber-400 focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all placeholder-gray-300 custom-scrollbar"
            />
          </div>

          {/* Preview box */}
          {htmlContent && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-[10px] font-bold text-[#3B2D2A]/40 uppercase tracking-[0.2em]">內容預覽 (Preview)</h2>
                <div className="flex-1 h-px bg-[#3B2D2A]/5"></div>
              </div>
              <div
                className="bg-white/90 backdrop-blur-sm border border-black/5 rounded-2xl p-6 lg:p-8 text-[15px] leading-loose text-[#3B2D2A] max-h-[400px] overflow-y-auto custom-scrollbar shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}
        </div>
        
        <p className="mt-12 text-center text-[10px] font-semibold text-[#3B2D2A]/30 tracking-widest uppercase">
          每封信都會自動包含個人化的退訂連結，符合電子報發送規範。
        </p>
      </div>
    </div>
  );
}
