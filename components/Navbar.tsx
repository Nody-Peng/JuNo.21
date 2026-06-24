import Link from 'next/link';

export default function Navbar() {
  const navItems = [
    { label: 'é¦–é?', link: '/' },
    { label: '?‡ç?', link: '/blog' },
    { label: 'è¨‚é–±?»å???, link: '/#subscribe' },
  ];

  return (
    <header className="w-full bg-[#3B2D2A] text-[#F9F8F6] relative z-50 shadow-md">
      <nav className="flex items-center justify-between py-4 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
        <div>
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img 
              src="/å¤è‡³?Ÿé?å·¥ä?å®?png" 
              alt="å¤è‡³?Ÿé?" 
              className="h-10 md:h-12 w-auto object-contain" 
            />
            <span className="font-serif text-xl md:text-2xl tracking-widest font-bold hidden sm:block">å¤è‡³?Ÿé?</span>
          </Link>
        </div>

        <div className="flex items-center gap-x-2 md:gap-x-4">
          {navItems.map((item, idx) => (
            <Link 
              key={idx} 
              href={item.link}
              className="text-sm font-semibold tracking-widest hover:text-amber-200 transition-all duration-300 hover:-translate-y-[1px] bg-white/5 hover:bg-white/10 px-4 md:px-5 py-2.5 rounded-full border border-transparent hover:border-white/10"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
