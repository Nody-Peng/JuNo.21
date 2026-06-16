import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#3B2D2A] text-[#F9F8F6] py-16 px-6 md:px-12 border-t border-[#4e3d39]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Brand Info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="mb-6 inline-block hover:opacity-90 transition-opacity">
             <img src="/夏至原點工作室.jpeg" alt="夏至原點" className="h-16 w-auto object-contain" />
          </Link>
          <p className="text-[#F9F8F6]/70 max-w-[320px] font-light tracking-wide text-sm leading-relaxed">
            從台北到聖塔芭芭拉，一萬公里的遠距離交換日記。記錄著瑣碎日常與真心推薦的生活選物。
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-4 text-sm font-sans font-medium tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">Facebook</a>
          <a href="#" className="hover:text-white transition-colors">聯絡我</a>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-[#4e3d39] text-xs text-[#F9F8F6]/40 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 tracking-widest">
        <span>© 2026 夏至原點. All rights reserved.</span>
        <span>Made with Payload CMS & Next.js</span>
      </div>
    </footer>
  );
}
