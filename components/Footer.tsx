import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#3B2D2A] text-[#F9F8F6] py-16 px-6 md:px-12 border-t border-[#4e3d39]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Brand Info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="mb-6 inline-block hover:opacity-90 transition-opacity">
             <img src="/å¤è‡³?Ÿé?å·¥ä?å®?png" alt="å¤è‡³?Ÿé?" className="h-16 w-auto object-contain" />
          </Link>
          <p className="text-[#F9F8F6]/70 max-w-[320px] font-light tracking-wide text-sm leading-relaxed">
            å¾å°?—åˆ°?–å??­èŠ­?‰ï?ä¸€?¬å…¬?Œç?? è??¢äº¤?›æ—¥è¨˜ã€‚è??„è?????¥å¸¸?‡ç?å¿ƒæ¨?¦ç??Ÿæ´»?¸ç‰©??          </p>
        </div>
        <div className="flex flex-col md:items-end gap-4 text-sm font-sans font-medium tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">Facebook</a>
          <a href="#" className="hover:text-white transition-colors">?¯çµ¡??/a>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-[#4e3d39] text-xs text-[#F9F8F6]/40 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 tracking-widest">
        <span>Â© 2026 å¤è‡³?Ÿé?. All rights reserved.</span>
        <span>Made with Payload CMS & Next.js</span>
      </div>
    </footer>
  );
}
