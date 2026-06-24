import ScrollReveal from './ScrollReveal';

export default function AboutSection() {
  return (
    <section className="w-full bg-[#E8F3E8] py-0 border-y border-[#3B2D2A]/10 flex flex-col md:flex-row overflow-hidden">
      <ScrollReveal 
        direction="right"
        className="w-full md:w-[45%] min-h-[500px] md:min-h-[700px] bg-stone-200 relative"
      >
        <img src="https://picsum.photos/seed/morgan/1000/1200" alt="About Me" className="w-full h-full object-cover" />
      </ScrollReveal>
      <div className="w-full md:w-[55%] flex flex-col items-center justify-center p-12 md:p-24 relative">
        
        <ScrollReveal direction="up" delay={100}>
          <h2 className="text-4xl md:text-5xl font-serif text-[#3B2D2A] tracking-widest drop-shadow-sm mb-8 text-center md:text-left">
            ?œæ–¼?‘å€?          </h2>
        </ScrollReveal>
        
        <ScrollReveal direction="scale" delay={250}>
          <div className="w-24 md:w-32 mb-10 mix-blend-multiply flex justify-center md:justify-start">
             <img src="/å¤è‡³?Ÿé?å·¥ä?å®?png" alt="å¤è‡³?Ÿé?å·¥ä?å®? className="w-full h-auto object-contain" />
          </div>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={400}>
          <p className="text-[#3B2D2A] text-center max-w-[600px] leading-[2] font-sans text-sm md:text-base font-medium tracking-wide">
            ?‘å€‘æ˜¯å¤è‡³?Ÿé??‚å??ºå¥¹?å?? å??–å??­èŠ­?‰æ”»è®€?°ç??šå£«ï¼Œæ??‘é??Ÿä??™æ®µ? è??¢æ??›ã€?br/><br/>
            ?™å€‹éƒ¨?½æ ¼å°±å??¯æ??‘è·¨è¶Šå¤ªå¹³æ??„äº¤?›æ—¥è¨˜ã€‚é€™è£¡æ²’æ?ä»€éº¼å¤§?“ç?ï¼Œåª?‰å…©?‹äºº?„è‡ª?„ç?æ´»ç??‡ã€é?è·é›¢?„é…¸?œè‹¦è¾???„æ??‘å€‘ç?å¿ƒè¦ºå¾—å¥½?¨ã€æƒ³?¨è–¦çµ¦ä??„ç?æ´»é¸?©ã€?br/><br/>
            ?¡è?ä½ ä??¨ç?æ­·é?è·é›¢ï¼Œé??¯å–®ç´”å?æ­¡æ??‘ç??…ä?ï¼Œéƒ½æ­¡è?ä½ åœ¨?™è£¡?œä??³æ­¥??          </p>
        </ScrollReveal>

      </div>
    </section>
  );
}
