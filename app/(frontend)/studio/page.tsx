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
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/logo.png" alt="夏至原點" className="h-16 w-auto object-contain mx-auto mb-4 opacity-90" />
          <h1 className="font-serif text-2xl font-bold text-[#3B2D2A] tracking-widest">編輯室</h1>
          <p className="text-sm text-[#3B2D2A]/50 mt-1 tracking-wide">僅限受邀成員登入</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#3B2D2A]/60 mb-1.5 tracking-wider uppercase">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[#3B2D2A]/15 bg-white text-[#3B2D2A] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-400 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3B2D2A]/60 mb-1.5 tracking-wider uppercase">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#3B2D2A]/15 bg-white text-[#3B2D2A] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-400 transition text-sm"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-[#3B2D2A] text-[#F9F8F6] font-medium tracking-widest hover:bg-[#2a1f1c] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
          >
            {isPending ? '登入中...' : '進入編輯室'}
          </button>
        </form>

        <p className="text-center text-xs text-[#3B2D2A]/30 mt-8">
          © 夏至原點 · 私密入口
        </p>
      </div>
    </div>
  );
}
