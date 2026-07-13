import type { ReactNode } from 'react'

export default function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <header className="section-padding py-6 border-b border-[#1A1A1A]/[0.06]">
        <div className="container-max flex items-center justify-between">
          <a href="./" className="flex flex-col leading-none">
            <span className="text-lg font-semibold tracking-tight">Just Pablo</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#DC2626] mt-1">Digital</span>
          </a>
          <a href="./" className="text-sm font-medium text-[#DC2626] hover:underline">← Начало</a>
        </div>
      </header>
      <main className="section-padding py-12 lg:py-20">
        <div className="container-max max-w-3xl">
          <h1 className="font-thin-display text-3xl lg:text-5xl mb-8">{title}</h1>
          <div className="space-y-4 text-base font-light text-[#1A1A1A]/80 leading-relaxed">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
