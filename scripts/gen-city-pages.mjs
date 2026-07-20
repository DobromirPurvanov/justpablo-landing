/**
 * Генерира локалните HTML страници (varna.html, sofia.html, ...) и sitemap.xml
 * от src/lib/cities.ts.
 *
 *   npm run gen:cities
 *
 * Пише се машинно нарочно: мета таговете, schema.org данните и текстът в
 * React компонентите идват от един и същ обект, така че заглавието в Google
 * не може да се размине с H1 на страницата.
 */
import { build } from 'esbuild'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Зарежда cities.ts, като го компилира до временен .mjs (Node не чете TS). */
async function loadCities() {
  const dir = await mkdtemp(path.join(tmpdir(), 'jp-cities-'))
  const out = path.join(dir, 'cities.mjs')
  await build({
    entryPoints: [path.join(root, 'src/lib/cities.ts')],
    outfile: out,
    format: 'esm',
    bundle: false,
    logLevel: 'warning',
  })
  try {
    return await import(pathToFileURL(out).href)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function pageHtml(city, site) {
  const url = `${site}/${city.slug}`
  const ogTitle = `Just Pablo Digital | Дигитален маркетинг ${city.inName}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: city.title,
        description: city.description,
        inLanguage: 'bg',
        isPartOf: { '@id': `${site}/#website` },
        about: { '@id': `${url}#localbusiness` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Начало', item: `${site}/` },
          { '@type': 'ListItem', position: 2, name: city.name, item: url },
        ],
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${url}#localbusiness`,
        name: `Just Pablo Digital — ${city.name}`,
        url,
        parentOrganization: { '@id': `${site}/#organization` },
        image: `${site}/images/og-logo.jpg`,
        description: city.description,
        email: 'adsjustpablo@gmail.com',
        priceRange: '€€',
        address: {
          '@type': 'PostalAddress',
          addressLocality: city.name,
          addressRegion: city.region,
          postalCode: city.postalCode,
          addressCountry: 'BG',
        },
        geo: { '@type': 'GeoCoordinates', latitude: city.geo.lat, longitude: city.geo.lng },
        areaServed: { '@type': 'City', name: city.name },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Дигитални услуги ${city.inName}`,
          itemListElement: [
            'Инфлуенсър маркетинг',
            'Локално SEO и Google Business Profile',
            'Google Ads и Meta Ads',
            'Брандинг и дизайн',
            'Социални мрежи и видео',
          ].map(name => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: `${name} ${city.inName}`,
              areaServed: { '@type': 'City', name: city.name },
              provider: { '@id': `${site}/#organization` },
            },
          })),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: city.faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }

  return `<!doctype html>
<!-- ГЕНЕРИРАН ФАЙЛ — не редактирайте ръчно.
     Източник: src/lib/cities.ts + scripts/gen-city-pages.mjs (npm run gen:cities) -->
<html lang="bg" data-city="${city.slug}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
    <!-- Montserrat се self-host-ва през @fontsource (src/fonts.ts) — без Google CDN. -->
    <title>${esc(city.title)}</title>
    <meta name="description" content="${esc(city.description)}" />
    <meta name="theme-color" content="#DC2626" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="geo.region" content="BG-${city.region === 'София-град' ? '22' : city.region === 'Варна' ? '03' : city.region === 'Пловдив' ? '16' : '02'}" />
    <meta name="geo.placename" content="${esc(city.name)}" />
    <meta name="geo.position" content="${city.geo.lat};${city.geo.lng}" />
    <meta name="ICBM" content="${city.geo.lat}, ${city.geo.lng}" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" type="image/png" href="./favicon.png" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Just Pablo Digital" />
    <meta property="og:locale" content="bg_BG" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(ogTitle)}" />
    <meta property="og:description" content="${esc(city.description)}" />
    <meta property="og:image" content="${site}/images/og-logo.jpg" />
    <meta property="og:image:width" content="747" />
    <meta property="og:image:height" content="747" />
    <meta property="og:image:alt" content="Just Pablo Digital" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(ogTitle)}" />
    <meta name="twitter:description" content="${esc(city.description)}" />
    <meta name="twitter:image" content="${site}/images/og-logo.jpg" />

    <!-- Schema.org structured data -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)
  .split('\n')
  .map(l => '    ' + l)
  .join('\n')}
    </script>
    <!-- GA4 и Meta Pixel НЕ се зареждат тук. Инжектират се от
         src/lib/consent.ts ЕДВА след съгласие „Приемам" (GDPR). -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/city.tsx"></script>
  </body>
</html>
`
}

function sitemapXml(cities, site) {
  const urls = [
    { loc: `${site}/`, priority: '1.0' },
    ...cities.map(c => ({ loc: `${site}/${c.slug}`, priority: '0.8' })),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>
`
}

const { cities, SITE_URL } = await loadCities()

for (const city of cities) {
  const file = path.join(root, `${city.slug}.html`)
  await writeFile(file, pageHtml(city, SITE_URL), 'utf8')
  console.log('✓', path.relative(root, file))
}

await writeFile(path.join(root, 'public/sitemap.xml'), sitemapXml(cities, SITE_URL), 'utf8')
console.log('✓ public/sitemap.xml')
