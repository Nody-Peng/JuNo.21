'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/auth';

export default function StudioPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await loginAction(email, password);
      if (result.success) {
        router.push('/my-posts');
        router.refresh();
      } else {
        setError(result.error || '登入失敗');
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#F9F8F6] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-[#F9F8F6] to-[#F9F8F6] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="夏至原點" className="h-16 w-auto object-contain mx-auto mb-6 opacity-90" />
          <h1 className="font-serif text-3xl font-bold text-[#3B2D2A] tracking-[0.15em] ml-2">編輯室</h1>
          <div className="w-8 h-px bg-[#3B2D2A]/20 mx-auto mt-4 mb-3" />
          <p className="text-[10px] text-[#3B2D2A]/40 tracking-widest uppercase">Authorised Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_32px_rgba(59,45,42,0.05)]">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-semibold text-[#3B2D2A]/50 mb-2 tracking-widest uppercase ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 rounded-2xl border-none bg-white/50 text-[#3B2D2A] placeholder-[#3B2D2A]/20 focus:outline-none focus:ring-1 focus:ring-[#3B2D2A]/20 focus:bg-white transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#3B2D2A]/50 mb-2 tracking-widest uppercase ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-2xl border-none bg-white/50 text-[#3B2D2A] placeholder-[#3B2D2A]/20 focus:outline-none focus:ring-1 focus:ring-[#3B2D2A]/20 focus:bg-white transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 px-4 py-3 rounded-xl bg-red-50/80 border border-red-100/50 text-red-600/90 text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-8 py-4 rounded-2xl bg-[#3B2D2A] text-[#F9F8F6] text-[13px] font-medium tracking-[0.2em] hover:bg-[#2a1f1c] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none ml-[0.1em]"
          >
            {isPending ? '驗證中...' : '登入系統'}
          </button>
        </form>
      </div>
    </div>
  );
}
