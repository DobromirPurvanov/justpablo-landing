import { createRoot } from 'react-dom/client'
import LegalLayout from './LegalLayout'
import '../fonts'
import '../index.css'

createRoot(document.getElementById('root')!).render(
  <LegalLayout title="Политика за бисквитки">
    <p>
      Настоящата страница описва как Just Pablo Digital използва бисквитки и подобни технологии на уебсайта си.
    </p>
    <h2 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">Какво са бисквитки?</h2>
    <p>
      Бисквитките са малки текстови файлове, които се запазват на вашето устройство при посещение на даден уебсайт. Те позволяват на сайта да запомни вашите действия и предпочитания за определен период от време.
    </p>
    <h2 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">Какви бисквитки използваме?</h2>
    <ul className="list-disc pl-5 space-y-2">
      <li>
        <strong>Необходими бисквитки.</strong> Осигуряват коректната работа на сайта и формата за запитвания.
      </li>
      <li>
        <strong>Аналитични бисквитки.</strong> Помагат ни да разберем как посетителите взаимодействат със сайта, за да го подобрим.
      </li>
      <li>
        <strong>Предпочитания.</strong> Запазват временен прогрес във формата, за да не губите въведена информация.
      </li>
    </ul>
    <h2 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">Управление на бисквитки</h2>
    <p>
      Можете да изтриете или блокирате бисквитките чрез настройките на вашия браузър. Имайте предвид, че ограничаването им може да повлияе на функционалността на сайта.
    </p>
    <h2 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">Контакт</h2>
    <p>
      Ако имате въпроси относно бисквитките, свържете се с нас на{' '}
      <a href="mailto:adsjustpablo@gmail.com" className="text-[#DC2626] hover:underline">adsjustpablo@gmail.com</a>.
    </p>
  </LegalLayout>,
)
