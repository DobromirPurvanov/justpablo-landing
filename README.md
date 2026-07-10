# Just Pablo Digital — Landing

Едностранична landing страница за събиране на запитвания, докато пълният сайт е в разработка.

## Стартиране

```bash
npm install
npm run dev      # локално на :3000
npm run build    # продукционен build в dist/
```

## Деплой

Статичен сайт без router — качва се навсякъде (Vercel, Netlify, GitHub Pages) без допълнителна конфигурация. `base: './'` е зададен, така че работи и в поддиректория.

## Къде се редактира

- **Числата на лентата** — `src/components/StatsBand.tsx` (default масива)
- **Резултатите на клиенти** — `src/sections/ResultsGrid.tsx`
- **Цената и включеното** — `src/sections/PriceSpotlight.tsx` (курсът евро/лев е в `src/lib/currency.ts`)
- **Въпросите във формата** — `src/components/ScrollWizard.tsx` (масива `questions`)
- **Контакти и социални** — `src/sections/LandingFooter.tsx` и контактния ред в `ScrollWizard.tsx`

## Забележка за формата

Формата в момента показва успех локално (`setIsSuccess`). За реално получаване на запитвания вържете submit-а към ваш endpoint / Formspree / имейл услуга в `ScrollWizard.tsx` (търсете `setIsSuccess(true)`).
