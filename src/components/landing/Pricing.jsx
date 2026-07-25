import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const [openCard, setOpenCard] = useState(null);
  const navigate = useNavigate();

  const plans = [
    {
      title: "Составление программы тренировок",
      price: "3 000 ₽",
      features: [
        "Индивидуальная программа тренировок под ваши цели",
        "Учитываются количество тренировок, ограничения по здоровью и приоритетные мышечные группы",
        "Рекомендации по выполнению программы и прогрессии нагрузок",
        "Объяснение базовых тренировочных принципов: объем, интенсивность, RIR, диапазоны повторений и других тренировочных переменных",
        "Ответы на возникающие вопросы после получения программы",
      ],
    },

    {
      title: "Онлайн-сопровождение",
      price: "7 000 ₽",
      period: "/ месяц",
      features: [
        "Всё, что входит в программу тренировок",
        "Индивидуальный расчет калорийности и БЖУ",
        "Еженедельный анализ отчетов и корректировка тренировок и питания",
        "Постоянная связь и ответы на возникающие вопросы",
        "Разбор техники выполнения упражнений по видео",
        "Доступ к платформе Stubborn Ram",
      ],
    },

    {
      title: "Онлайн-сопровождение + обучающий контент",
      price: "12 000 ₽",
      period: "/ месяц",
      features: [
        "Всё, что входит в онлайн-сопровождение",
        "Полный доступ к библиотеке обучающих материалов",
        "Материалы по анатомии и биомеханике",
        "Построение тренировочного процесса и техника выполнения упражнений",
        "Обучение самостоятельному составлению программ тренировок и питания",
        "Регулярное пополнение библиотеки новыми материалами",
        "Приоритетная обратная связь по вопросам обучения",
      ],
    },
  ];

  return (
    <section className="pricing">
      <h2 className="sectionTitle">Форматы сотрудничества</h2>

      <div className="pricingList">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`pricingCard ${openCard === index ? "open" : ""}`}
            onClick={() => setOpenCard(openCard === index ? null : index)}
          >
            <div className="pricingHeader">
              <h3>{plan.title}</h3>

              <div className="cardCorner">
                <span>{openCard === index ? "−" : "+"}</span>
              </div>
            </div>

            <div
              className={`pricingContentWrapper ${
                openCard === index ? "open" : ""
              }`}
            >
              <div className="pricingContent">
                <ul className="pricingFeatures">
                  {plan.features.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <div className="pricingBottom">
                  <div className="pricingPrice">
                    {plan.price}

                    {plan.period && (
                      <span className="pricingPeriod">{plan.period}</span>
                    )}
                  </div>

                  <button
                    className="pricingButton"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (index === 0) {
                        navigate("/questionnaire/program");
                      } else {
                        navigate("/questionnaire/coaching");
                      }
                    }}
                  >
                    Оставить заявку
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
