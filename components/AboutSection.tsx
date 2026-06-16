export default function AboutSection() {
  return (
    <section className="w-full bg-[#E8F3E8] py-0 border-y border-[#3B2D2A]/10 flex flex-col md:flex-row">
      <div className="w-full md:w-[45%] min-h-[500px] md:min-h-[700px] bg-stone-200 relative">
        <img src="https://picsum.photos/seed/morgan/1000/1200" alt="About Me" className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-[55%] flex flex-col items-center justify-center p-12 md:p-24 relative">
        
        <div className="bg-[#3B2D2A] text-white p-8 pb-12 md:p-12 md:pb-16 shadow-2xl relative w-full max-w-[400px]">
          <div className="w-full aspect-[4/3] bg-stone-300 mb-8 overflow-hidden rounded-sm">
             <img src="https://picsum.photos/seed/yoga/800/600" alt="Lifestyle" className="w-full h-full object-cover" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-center tracking-widest text-white">關於我們</h2>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-serif text-[#3B2D2A] font-bold tracking-widest drop-shadow-sm mt-12 hidden md:block">
          夏至原點
        </h2>
        
        <p className="mt-12 text-[#3B2D2A] text-center max-w-[600px] leading-[2] font-sans text-sm md:text-base font-medium tracking-wide">
          我們是夏至原點。因為她前往加州聖塔芭芭拉攻讀地理博士，我們開啟了這段遠距離戀愛。<br/><br/>
          這個部落格就像是我們跨越太平洋的交換日記。這裡沒有什麼大道理，只有兩個人各自的生活碎片、遠距離的酸甜苦辣，還有我們真心覺得好用、想推薦給你的生活選物。<br/><br/>
          無論你也在經歷遠距離，還是單純喜歡我們的故事，都歡迎你在這裡停下腳步。
        </p>

      </div>
    </section>
  );
}
