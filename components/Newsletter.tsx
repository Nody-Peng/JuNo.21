export default function Newsletter() {
  return (
    <section id="subscribe" className="w-full relative py-24 md:py-32 bg-stone-200 border-t border-[#3B2D2A]/10">
      <div className="absolute inset-0 w-full h-full">
        <img src="https://picsum.photos/seed/livingroom/1920/1080" alt="Interior" className="w-full h-full object-cover opacity-90" />
      </div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col">
        
        <h2 className="text-5xl md:text-[7rem] font-serif text-[#3B2D2A] tracking-widest mb-8 md:mb-12 drop-shadow-sm mix-blend-color-burn">
          訂閱電子報
        </h2>

        <div className="bg-[#F9F8F6] p-8 md:p-12 w-full max-w-[500px] shadow-2xl rounded-sm">
          <p className="font-serif text-xl md:text-2xl text-[#3B2D2A] mb-8 leading-relaxed tracking-wide">
            每月一封信：最新文章與選物推薦，絕不發送垃圾郵件。
          </p>
          <form className="flex flex-col gap-6 font-sans">
            <div>
              <label className="block text-sm font-semibold text-[#3B2D2A] mb-2 tracking-widest">電子信箱 *</label>
              <input type="email" placeholder="請輸入你的 Email" className="w-full border-b border-[#3B2D2A]/30 bg-transparent py-3 text-[#3B2D2A] focus:outline-none focus:border-[#3B2D2A] transition-colors" />
            </div>
            <div className="flex items-start gap-3 mt-2">
              <input type="checkbox" className="mt-1 w-4 h-4 accent-[#3B2D2A]" />
              <label className="text-sm text-[#3B2D2A]/80 font-medium leading-relaxed">是的，我願意接收《夏至原點》的最新資訊與電子報。 *</label>
            </div>
            <button type="button" className="w-full bg-[#3B2D2A] text-white py-4 font-medium tracking-widest hover:bg-[#2a1f1d] transition-colors mt-4">
              送出訂閱
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
