import Link from 'next/link';
import ScrollReveal from './ScrollReveal';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#F9F8F6]">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#E2BCA8]/40 to-[#D4A373]/10 blur-[100px] opacity-70 animate-pulse mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-[#9BABB8]/40 to-[#E8F3E8]/10 blur-[120px] opacity-60 mix-blend-multiply" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-12 md:gap-24">
        
        {/* Left Typography */}
        <div className="w-full md:w-1/2 flex flex-col items-start pt-20 md:pt-0">
          <ScrollReveal direction="up" delay={0}>
            <h1 className="font-serif text-[3.5rem] md:text-[5.5rem] lg:text-[6.5rem] leading-[1.1] text-[#2C2422] tracking-wide text-balance">
              跨越時差
              <br />
              <span className="font-light text-[#8A6A5C] text-[3rem] md:text-[4.5rem] lg:text-[5.5rem]">的日常</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150}>
            <p className="mt-8 text-[#5C4F4A] text-lg md:text-xl font-sans font-light tracking-widest leading-relaxed max-w-[500px]">
              她去了加州讀地理博士，我們隔著一萬公里。<br className="hidden md:block"/>
              寫下遠距離的瑣碎、生活，與真心推薦的好物。
            </p>
          </ScrollReveal>
          
          {/* Buttons */}
          <ScrollReveal direction="up" delay={300} className="mt-10 flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <Link 
              href="/blog" 
              className="group relative px-8 py-4 bg-[#2C2422] text-[#F9F8F6] rounded-full overflow-hidden w-full sm:w-auto text-center shadow-xl shadow-[#2C2422]/10 hover:shadow-2xl hover:shadow-[#2C2422]/20 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#8A6A5C] to-[#5C4F4A] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
              <span className="relative z-10 font-sans font-medium tracking-widest text-sm flex items-center justify-center gap-2">
                開始閱讀
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>

            <a 
              href="#subscribe" 
              className="px-8 py-4 border border-[#2C2422]/20 text-[#2C2422] rounded-full font-sans font-medium tracking-widest text-sm hover:bg-[#2C2422]/5 transition-colors w-full sm:w-auto text-center bg-white/10 backdrop-blur-md"
            >
              訂閱電子報
            </a>
          </ScrollReveal>
        </div>

        {/* Right Section (Editorial Collage Architecture) */}
        <div className="w-full md:w-1/2 relative h-auto md:h-[700px] flex gap-4 md:gap-6 mt-16 md:mt-0 px-4 md:px-0">
          
          {/* Column 1: Tall Image */}
          <div className="w-1/2 flex flex-col justify-end pb-0 md:pb-10">
            <ScrollReveal direction="up" delay={100} className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
              <img src="https://picsum.photos/seed/taipeicity/600/800" alt="Scenery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </ScrollReveal>
          </div>

          {/* Column 2: Stacked Images */}
          <div className="w-1/2 flex flex-col gap-4 md:gap-6 pt-0 md:pt-16">
            <ScrollReveal direction="left" delay={250} className="w-full aspect-square rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
              <img src="https://picsum.photos/seed/sbbeach/600/600" alt="Details" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={400} className="w-[90%] aspect-[4/3] rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
              <img src="https://picsum.photos/seed/coffee/600/450" alt="Food" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
