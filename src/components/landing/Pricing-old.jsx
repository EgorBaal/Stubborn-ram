export default function Pricing() {
  return (
    <section className="pricing">
      <div className="container">
        <h2 className="section-title">Форматы сотрудничества</h2>

        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Индивидуальная программа</h3>

            <div className="price">
              3 000<span>₽</span>
            </div>

            <p className="price-description">
              Персональная тренировочная программа, составленная с учетом ваших
              целей, уровня подготовки и доступного оборудования.
            </p>

            <button className="pricing-button">Подробнее</button>
          </div>

          <div className="pricing-card featured">
            <div className="popular-badge">Самый популярный</div>

            <h3>Полное онлайн-сопровождение</h3>

            <div className="price">
              7 000<span>₽</span>
            </div>

            <div className="price-month">в месяц</div>

            <p className="price-description">
              Полное сопровождение: тренировки, питание, еженедельный анализ,
              корректировки и работа через платформу Stubborn Ram.
            </p>

            <button className="pricing-button">Подробнее</button>
          </div>

          <div className="pricing-card">
            <h3>Сопровождение + обучение</h3>

            <div className="price">
              12 000<span>₽</span>
            </div>

            <div className="price-month">в месяц</div>

            <p className="price-description">
              Всё, что входит в сопровождение, плюс доступ к образовательной
              платформе по анатомии, биомеханике и построению тренировочного
              процесса.
            </p>

            <button className="pricing-button">Подробнее</button>
          </div>
        </div>
      </div>
    </section>
  );
}
