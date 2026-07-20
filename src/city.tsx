import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { getCity } from './lib/cities'
import './fonts'
import './index.css'

/** Общ entry за всички локални страници. Кой е градът се чете от
    <html data-city="varna"> — така четирите HTML файла ползват един и същ
    бъндъл вместо четири почти еднакви. */
const city = getCity(document.documentElement.dataset.city)

if (!city) {
  // По-добре шумна грешка при билд/дев, отколкото тиха начална страница
  // с мета тагове за град, който не съществува.
  console.error('[city] Непознат data-city:', document.documentElement.dataset.city)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App city={city} />
  </StrictMode>,
)
