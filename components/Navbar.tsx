import Link from 'next/link';
import { cookies } from 'next/headers';
import { logoutAction } from '@/lib/auth';

export default async function Navbar() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get('writer-token')?.value;
  const userStr = cookieStore.get('writer-user')?.value;
  const user = userStr ? JSON.parse(userStr) : null;

  const navItems = [
    { label: '首頁', link: '/' },
    { label: '文章', link: '/blog' },
    { label: '訂閱電子報', link: '/#subscribe' },
  ];

  return (
    <header className="w-full bg-[#3B2D2A] text-[#F9F8F6] relative z-50 shadow-md">
      <nav className="flex items-center justify-between py-4 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
        <div>
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src="/logo.png"
              alt="夏至原點"
              className="h-10 md:h-12 w-auto object-contain"
            />
            <span className="font-serif text-xl md:text-2xl tracking-widest font-bold hidden sm:block">夏至原點</span>
          </Link>
        </div>

        <div className="flex items-center gap-x-2 md:gap-x-3">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.link}
              className="text-sm font-semibold tracking-widest hover:text-amber-200 transition-all duration-300 hover:-translate-y-[1px] bg-white/5 hover:bg-white/10 px-4 md:px-5 py-2.5 rounded-full border border-transparent hover:border-white/10"
            >
              {item.label}
            </Link>
          ))}

          {isLoggedIn ? (
            <>
              <Link
                href="/write"
                className="flex items-center gap-1.5 text-sm font-semibold tracking-widest text-amber-200 hover:text-amber-100 bg-amber-900/30 hover:bg-amber-900/50 px-4 py-2.5 rounded-full border border-amber-700/40 hover:border-amber-600/60 transition-all duration-300"
              >
                ✍️ 寫文章
              </Link>
              <Link
                href="/my-posts"
                className="text-sm font-semibold tracking-widest hover:text-amber-200 transition-all duration-300 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-full border border-transparent hover:border-white/10"
              >
                我的文章
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1"
                  title={`登出 ${user?.email || ''}`}
                >
                  登出
                </button>
              </form>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
