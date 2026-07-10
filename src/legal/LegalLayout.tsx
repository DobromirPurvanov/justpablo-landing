import type { ReactNode } from 'react'

export default function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="section-padding py-6 border-b border-[#1A1A1A]/[0.06]">
        <div className="container-max flex items-center justify-between">
          <a href="./index.html" className="flex items-center gap-3">
            <img src="./images/logo-mark.png" alt="" className="w-10 h-10 object-contain" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-semibold tracking-tight text-[#1A1A1A]">Just Pablo</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#DC2626] mt-1">Digital</span>
            </span>
          </a>
          <a href="./index.html" className="text-sm font-medium text-[#DC2626] hover:underline">← Обратно към сайта</a>
        </div>
      </header>

      <main className="section-padding py-14 lg:py-20 flex-1">
        <div className="container-max max-w-3xl">
          <h1 className="font-thin-display text-3xl lg:text-5xl text-[#1A1A1A] leading-tight mb-3">{title}</h1>
          <p className="text-xs font-light text-[#1A1A1A]/50 mb-10">Последна актуализация: {updated}</p>
          <div className="flex flex-col gap-8 text-[15px] font-light text-[#1A1A1A]/80 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#1A1A1A] [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_a]:text-[#DC2626]">
            {children}
          </div>
        </div>
      </main>

      <footer className="section-padding py-6 border-t border-[#1A1A1A]/[0.06]">
        <div className="container-max text-xs font-light text-[#1A1A1A]/50">
          © {new Date().getFullYear()} Just Pablo Digital · <a href="mailto:info@justpablo.bg" className="text-[#DC2626]">info@justpablo.bg</a>
        </div>
      </footer>
    </div>
  )
}
