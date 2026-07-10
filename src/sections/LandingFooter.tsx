export default function LandingFooter() {
  return (
    <footer id="contacts" className="bg-[#1A1A1A] text-white">
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
              <div className="flex flex-col gap-2">
                <a href="https://facebook.com/JustPablo.official" target="_blank" rel="noreferrer" className="text-sm font-light text-white/70 hover:text-[#DC2626] transition-colors">Facebook — /JustPablo.official</a>
                <a href="https://instagram.com/justpablo_official" target="_blank" rel="noreferrer" className="text-sm font-light text-white/70 hover:text-[#DC2626] transition-colors">Instagram — @justpablo_official</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 text-xs font-light text-white/40">
            © {new Date().getFullYear()} Just Pablo Digital. Всички права запазени.
          </div>
        </div>
      </div>
    </footer>
  )
}
