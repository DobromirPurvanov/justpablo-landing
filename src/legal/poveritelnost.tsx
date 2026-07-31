import { createRoot } from 'react-dom/client'
import LegalLayout from './LegalLayout'
import '../fonts'
import '../index.css'

createRoot(document.getElementById('root')!).render(
  <LegalLayout title="Защита на личните данни">
    <p>
      Just Pablo Digital се ангажира да защитава личните данни на посетителите и клиентите си. Настоящата политика обяснява какви данни събираме и как ги обработваме.
    </p>
    <h2 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">Какви данни събираме?</h2>
    <p>
      Чрез формата за запитвания събираме само информацията, която ни е необходима, за да се свържем с вас: име и фамилия, имейл адрес, телефон (по избор), име на бизнес или сайт (по избор), както и отговорите на въпросите за вашия бизнес.
    </p>
    <h2 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">За какви цели ги използваме?</h2>
    <ul className="list-disc pl-5 space-y-2">
      <li>Да се запознаем с вашия бизнес и да подготвим персонализирано предложение.</li>
      <li>Да се свържем с вас в рамките на 24 часа.</li>
      <li>Да подобрим работата на сайта и формата за запитвания.</li>
    </ul>
    <h2 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">Съхранение и сигурност</h2>
    <p>
      Данните се съхраняват за срок, необходим за целите на комуникацията, и се обработват със съответните технически и организационни мерки за сигурност.
    </p>
    <h2 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">Защита от злоупотреба</h2>
    {/* Тази секция е УСЛОВИЕ за невидимия режим на Turnstile — не я махайте. */}
    <p>
      Формата за запитвания е защитена с Cloudflare Turnstile, който различава хората от автоматизираните ботове. Проверката е невидима и не изисква действие от вас. За целта Cloudflare обработва ограничена техническа информация за браузъра и заявката. Turnstile не използва данните за реклама и не проследява посетителите между сайтове — подробностите са в{' '}
      <a href="https://www.cloudflare.com/application-services/terms/turnstile-privacy-addendum/" target="_blank" rel="noopener noreferrer" className="text-[#DC2626] hover:underline">Turnstile Privacy Addendum</a> на Cloudflare.
    </p>
    <h2 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">Вашите права</h2>
    <p>
      Имате право на достъп, корекция или изтриване на личните си данни, както и право да възразите срещу тяхната обработка. За това можете да се свържете с нас на{' '}
      <a href="mailto:adsjustpablo@gmail.com" className="text-[#DC2626] hover:underline">adsjustpablo@gmail.com</a>.
    </p>
  </LegalLayout>,
)
