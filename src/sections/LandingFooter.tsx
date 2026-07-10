import LogoFace from '../components/LogoFace'

export default function LandingFooter() {
  return (
    <footer id="contacts" className="relative bg-[#1A1A1A] text-white">
      {/* Pablo наднича над ръба на футъра — вижда се само горната половина (очила + очи),
          мустакът остава „скрит" зад черната стена. Очите следват мишката / оглеждат се на touch. */}
      <div
        aria-hidden="true"
        className="absolute bottom-full right-6 lg:right-16 w-[112px] h-[63px] lg:w-[176px] lg:h-[99px] overflow-hidden pointer-events-none select-none"
      >
        <LogoFace className="w-full" />
      </div>
      <div className="section-padding py-14 lg:py-16">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-3 mb-6">
                <img src="./images/logo-mark-white.png" alt="Just Pablo Digital" loading="lazy" decoding="async" className="w-9 h-9 object-contain" />
                <span className="flex flex-col leading-none">
                  <span className="text-lg font-semibold text-white">Just Pablo</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#DC2626] mt-1">Digital</span>
                </span>
              </div>
              <p className="text-sm font-light text-white/60 leading-relaxed max-w-sm">
                Дигитална агенция, изградена върху най-голямата инфлуенсър платформа в България. Native подход, данни в реално време, измерими резултати.
              </p>
            </div>
            <div className="lg:col-span-4">
              <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-white/40 mb-4">Контакти</div>
              <a href="mailto:info@justpablo.bg" className="block text-sm text-[#DC2626] hover:text-white transition-colors mb-2">info@justpablo.bg</a>
              <a href="tel:0887654321" className="block text-sm font-light text-white/70 hover:text-white transition-colors mb-2">0887 654 321</a>
              <div className="text-sm font-light text-white/45">Варна, ул. Мария Луиза 47</div>
            </div>
            <div className="lg:col-span-3">
              <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-white/40 mb-4">Последвайте ни</div>
              <div className="flex items-center gap-3">
                <a href="https://facebook.com/JustPablo.official" target="_blank" rel="noreferrer" aria-label="Facebook"
                  className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-[#DC2626] hover:border-[#DC2626] hover:text-white transition-all duration-300">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V13h2.7v8h3.2z"/></svg>
                </a>
                <a href="https://instagram.com/justpablo_official" target="_blank" rel="noreferrer" aria-label="Instagram"
                  className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-[#DC2626] hover:border-[#DC2626] hover:text-white transition-all duration-300">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href="https://tiktok.com/@justpablo_official" target="_blank" rel="noreferrer" aria-label="TikTok"
                  className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-[#DC2626] hover:border-[#DC2626] hover:text-white transition-all duration-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2.2 1.9 3.9 4.4 4.1v3c-1.7 0-3.2-.5-4.4-1.4v6.6c0 3.6-2.6 6.2-6 6.2-3.3 0-5.9-2.4-5.9-5.8 0-3.3 2.6-5.9 6-5.9.4 0 .7 0 1 .1v3.2c-.3-.1-.7-.2-1-.2-1.6 0-2.8 1.2-2.8 2.8 0 1.6 1.2 2.7 2.8 2.7 1.7 0 2.9-1.2 2.9-3.1V3h3z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-light text-white/40">
            <span>© {new Date().getFullYear()} Just Pablo Digital. Всички права запазени.</span>
            <span className="flex items-center gap-5">
              <a href="./biskvitki.html" className="hover:text-white transition-colors">Политика за бисквитки</a>
              <a href="./poveritelnost.html" className="hover:text-white transition-colors">Защита на личните данни</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
