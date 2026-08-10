// GradientBackground — направен с 21st.dev Gradient Builder и изнесен като
// жив CSS (Copy-CSS фонът на builder-а плюс неговите soften-blur и grain
// пасове). Нула зависимости: един <div>, който пълни родителя си.
// Оригиналната рецепта („淡粉色“ — розово/синьо/лилаво/зелено) е ремиксирана в
// бранд тоновете на Just Pablo: бяло, сиво и загатнато червено. Позициите на
// петната и кривата на затихване на builder-а (1 → 0.844 → 0.5 → 0.156 → 0)
// са запазени едно към едно — сменени са само цветовете.
//
// Зърното е на `multiply`, не на оригиналния `overlay`: формулата на overlay
// върху бял фон връща точно бяло (Cb=1 → 1), тоест текстурата би била
// напълно невидима над бранд основата #FFFFFF.
//
// Ремикс на изходната рецепта (цветове, режим, финиш) в редактора:
// https://21st.dev/community/gradients/editor?from=d02073f9-0470-4702-9a3d-47329f0fbe3c
export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        containerType: "size",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFFFF",
          backgroundImage:
            "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.060'/></svg>\"), radial-gradient(circle at 66.94% 46.43%, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.042) 19.02%, rgba(220, 38, 38, 0.025) 38.05%, rgba(220, 38, 38, 0.008) 57.07%, rgba(220, 38, 38, 0) 76.1%), radial-gradient(circle at 34.69% 66.31%, rgba(247, 247, 247, 1) 0%, rgba(247, 247, 247, 0.844) 12.73%, rgba(247, 247, 247, 0.5) 25.45%, rgba(247, 247, 247, 0.156) 38.18%, rgba(247, 247, 247, 0) 50.9%), radial-gradient(circle at 48.93% 19.32%, rgba(250, 250, 250, 1) 0%, rgba(250, 250, 250, 0.844) 16.75%, rgba(250, 250, 250, 0.5) 33.5%, rgba(250, 250, 250, 0.156) 50.25%, rgba(250, 250, 250, 0) 67%), radial-gradient(circle at 80.23% 87.54%, rgba(220, 38, 38, 0.03) 0%, rgba(220, 38, 38, 0.025) 10.28%, rgba(220, 38, 38, 0.015) 20.55%, rgba(220, 38, 38, 0.005) 30.83%, rgba(220, 38, 38, 0) 41.1%)",
          backgroundSize: "120px 120px, auto, auto, auto, auto",
          backgroundBlendMode: "multiply, normal, normal, normal, normal",
        }}
      />
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.10,
          mixBlendMode: "multiply",
        }}
      >
        <filter id="grain-d02073f9">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-d02073f9)" />
      </svg>
    </div>
  )
}
