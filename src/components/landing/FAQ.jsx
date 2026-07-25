import { useState } from "react";
import "./FAQ.css";

const faqItems = [
  {
    question: "Нужно ли мне самому вести какие-то таблицы?",
    answer:
      "Нет. Все таблицы и учет прогресса веду я. От вас требуется только один раз в неделю заполнить отчетную форму и отправить необходимые материалы.",
  },
  {
    question: "Что входит в еженедельный отчет?",
    answer: (
      <ul className="faqList">
        <li>Видео одного рабочего подхода каждого упражнения за неделю.</li>
        <li>Скриншоты тренировочного дневника.</li>
        <li>Скриншоты пищевого дневника (FatSecret).</li>
        <li>Замеры тела, указанные в форме отчета.</li>
        <li>Фотографии формы в день отчета.</li>
        <li>Заполненная анкета с вопросами о прошедшей неделе.</li>
      </ul>
    ),
  },
  {
    question: "Как часто мы выходим на связь?",
    answer:
      "Основной отчет отправляется один раз в неделю в заранее установленный день. Помимо этого, вы можете задавать вопросы в чате по мере необходимости.",
  },
  {
    question: "Как организовано питание?",
    answer:
      "Я рассчитываю индивидуальные значения КБЖУ. Вы самостоятельно вписываете в эти значения любые продукты.\n\nПосле этого ваша продуктовая корзина проходит мою проверку. Мы согласовываем продукты и их количество, чтобы рацион был одновременно комфортным и соответствовал поставленной цели.",
  },
];

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleItem = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq">
      {faqItems.map((item, index) => (
        <div
          key={index}
          className={`faqItem ${activeIndex === index ? "active" : ""}`}
        >
          <button className="faqQuestion" onClick={() => toggleItem(index)}>
            <span>{item.question}</span>

            <svg
              className="faqArrow"
              viewBox="0 0 24 24"
              width="22"
              height="22"
            >
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            className={`faqAnswerWrapper ${
              activeIndex === index ? "open" : ""
            }`}
          >
            <div className="faqAnswer">{item.answer}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default FAQ;
