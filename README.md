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

## Формата и имейлите

Формата праща към `api/send-email.js` (Vercel serverless), който изпраща през Resend **два** имейла:

1. **Известие към екипа** — едно писмо до всички в `TO_EMAIL_PRIMARY` / `TO_EMAIL_SECONDARY`, с Reply-To към клиента, така че „Reply" отговаря директно на него.
2. **Потвърждение към клиента** — копие от отговорите му, с Reply-To към `CLIENT_REPLY_TO`. Изпраща се best-effort: провал тук не проваля запитването.

Шаблоните са в `api/email-template.js` (`buildInquiryEmail`, `buildClientConfirmation`).

### Променливи на средата

Копирайте `.env.example` и попълнете. В Vercel се задават през Project → Settings → Environment Variables.

| Променлива | Задължителна | Бележка |
| --- | --- | --- |
| `RESEND_API_KEY` | да | без нея endpoint-ът връща 500 |
| `FROM_EMAIL` | не | по подразбиране `Just Pablo <zapitvane@just-pablo.com>`; домейнът трябва да е верифициран в Resend |
| `TO_EMAIL_PRIMARY` | да | поне един получател |
| `TO_EMAIL_SECONDARY` | не | втори получател в същото писмо |
| `CLIENT_REPLY_TO` | не | по подразбиране `adsjustpablo@gmail.com` |
| `RECAPTCHA_SECRET_KEY` | не | без нея заявките просто не се оценяват |
| `RECAPTCHA_MIN_SCORE` | не | по подразбиране `0.5` |

reCAPTCHA **никога не блокира** — само добавя предупредителна лента в имейла към екипа, за да не се губят реални клиенти.

### DNS (незавършено)

`just-pablo.com` няма **MX** записи, така че `zapitvane@just-pablo.com` не приема поща — затова Reply-To сочи към Gmail кутия. Липсва и **DMARC** запис, което вреди на доставяемостта в Gmail.
