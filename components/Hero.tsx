"use client"
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative w-full bg-[#4a3b37] pt-8 pb-16 md:pt-10 md:pb-24 overflow-hidden flex flex-col items-center justify-center">
      
      {/* Decorative overlapping images */}
      <div className="relative w-full max-w-[1000px] h-[300px] md:h-[420px] mx-auto flex justify-center items-center z-10">
        
        {/* Left skewed image */}
        <motion.div 
          initial={{ opacity: 0, x: -50, rotate: -15 }}
          animate={{ opacity: 1, x: 0, rotate: -6 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute left-4 md:left-[10%] top-[10%] md:top-[15%] w-[120px] md:w-[200px] aspect-[4/5] shadow-xl border-4 border-[#F9F8F6]/20 bg-stone-200 overflow-hidden z-20"
        >
          <img src="https://picsum.photos/seed/fashion1/500/600" alt="Vibe 1" className="w-full h-full object-cover" />
        </motion.div>

        {/* Center Main image */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="absolute w-[180px] md:w-[260px] aspect-[3/4] shadow-2xl border-4 border-white bg-stone-300 overflow-hidden z-30"
        >
          <img src="https://picsum.photos/seed/portrait1/600/800" alt="Main Portrait" className="w-full h-full object-cover" />
        </motion.div>

        {/* Right skewed image */}
        <motion.div 
          initial={{ opacity: 0, x: 50, rotate: 20 }}
          animate={{ opacity: 1, x: 0, rotate: 12 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute right-4 md:right-[15%] bottom-[10%] md:bottom-[15%] w-[110px] md:w-[160px] aspect-square shadow-xl border-4 border-[#F9F8F6]/20 bg-stone-200 overflow-hidden z-20"
        >
          <img src="https://picsum.photos/seed/interior1/400/400" alt="Vibe 2" className="w-full h-full object-cover" />
        </motion.div>

      </div>

      {/* Typography Overlay */}
      <div className="relative z-40 mt-[-20px] md:mt-[-30px] text-center px-4 flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-serif text-[3.5rem] md:text-[5.5rem] leading-[1.2] text-[#F9F8F6] tracking-widest drop-shadow-md text-balance"
        >
          跨越時差<br/>的日常
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-6 md:mt-8 text-[#F9F8F6]/90 text-base md:text-xl font-light tracking-widest text-balance max-w-[600px] mx-auto font-sans leading-relaxed"
        >
          她去了聖塔芭芭拉讀地理博士，我們隔著一萬公里。<br className="hidden md:block"/>
          於是有了這裡——寫下遠距離的瑣碎、生活，還有精挑細選的好物。
        </motion.p>
        
        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5, delay: 1 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/blog" className="relative group bg-[#F2B621] text-[#3B2D2A] px-8 py-3.5 rounded-full font-bold hover:bg-[#eab308] transition-all shadow-[0_0_20px_rgba(242,182,33,0.3)] hover:shadow-[0_0_30px_rgba(242,182,33,0.5)] w-full sm:w-auto overflow-hidden">
            <motion.span
               animate={{ y: [0, -3, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className="inline-block tracking-widest"
            >
              察看文章
            </motion.span>
          </Link>
          <a href="#subscribe" className="bg-transparent border border-[#F9F8F6]/40 text-[#F9F8F6] px-8 py-3.5 rounded-full font-medium hover:bg-[#F9F8F6]/10 transition-all w-full sm:w-auto tracking-widest">
            訂閱我
          </a>
        </motion.div>
      </div>
      
    </section>
  );
}
