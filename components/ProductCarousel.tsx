'use client';
import { useRef, useState, useEffect } from 'react';

export default function ProductCarousel({ items, sectionTitle }: { items: any[], sectionTitle?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current && scrollRef.current.scrollLeft > 20) {
        setShowHint(false);
      }
    };
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollBy = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="not-prose w-full my-16 relative select-none">
      <div className="flex items-center justify-between mb-8 px-2">
        {sectionTitle && (
          <h3 className="text-2xl font-serif text-[#3B2D2A] font-bold tracking-wide border-l-4 border-amber-700 pl-4 m-0">
            {sectionTitle}
          </h3>
        )}
        
        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex gap-3">
          <button 
            onClick={() => scrollBy(-400)}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:text-amber-700 hover:border-amber-200 hover:shadow-sm transition-all"
            aria-label="往左滑"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button 
            onClick={() => scrollBy(400)}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:text-amber-700 hover:border-amber-200 hover:shadow-sm transition-all"
            aria-label="往右滑"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Scroll Hint Overlay */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none transition-opacity duration-700 ${showHint ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-bounce">
            <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span className="text-sm font-medium tracking-widest">左右滑動探索更多</span>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className={`w-full overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory flex gap-6 hide-scrollbar ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((item: any, idx: number) => {
            const { productName, price, description, link, image } = item;
            const imageUrl = typeof image === 'object' && image?.url ? image.url : 'https://picsum.photos/seed/product/600/600';
            const imageAlt = typeof image === 'object' && image?.alt ? image.alt : productName;

            return (
              <div 
                key={idx} 
                className="shrink-0 w-[85vw] md:w-[400px] lg:w-[450px] snap-center bg-white/80 backdrop-blur-2xl border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden flex flex-col transition-transform hover:-translate-y-1 duration-300 pointer-events-auto"
                onDragStart={e => e.preventDefault()} // Prevent native image dragging from breaking scroll
              >
                {/* Image Section */}
                <div className="w-full relative aspect-square bg-stone-100 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={imageAlt} 
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700 pointer-events-none" 
                  />
                </div>

                {/* Content Section */}
                <div className="w-full p-8 flex flex-col flex-1 bg-white/50 relative">
                  <span className="inline-block text-[10px] font-bold tracking-widest text-[#8A6A5C] mb-3 uppercase">
                    Editor's Pick
                  </span>
                  
                  <h4 className="text-xl font-serif text-[#3B2D2A] leading-snug mb-2">
                    {productName}
                  </h4>
                  
                  {price && (
                    <p className="text-sm font-sans font-medium text-[#5C4F4A] mb-4">
                      {price}
                    </p>
                  )}
                  
                  <div className="text-[#3B2D2A]/80 leading-relaxed font-sans mb-6 text-sm whitespace-pre-wrap flex-1 cursor-text">
                    {description}
                  </div>
                  
                  {link && (
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group w-full flex items-center justify-center gap-3 bg-[#2C2422] text-[#F9F8F6] px-6 py-3 rounded-xl hover:bg-[#8A6A5C] transition-colors duration-300 shadow-sm font-sans text-xs font-medium tracking-widest mt-auto cursor-pointer"
                    >
                      查看詳情
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
