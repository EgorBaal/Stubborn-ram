import { Link } from "react-router-dom";
import "./ThankYou.css";
import "@/styles/page-transition.css";

export default function ThankYou() {
  return (
    <main className="thank-you page-transition">
      <div className="thank-you__container">
        <div className="thank-you__content">
          <div className="thank-you__icon">✓</div>

          <h1 className="thank-you__title">Спасибо за доверие!</h1>

          <p className="thank-you__subtitle">Ваша анкета успешно отправлена</p>

          <div className="thank-you__section">
            <div className="thank-you__number">01</div>

            <div>
              <h2>Изучу анкету</h2>
              <p>До 24 часов</p>
            </div>
          </div>

          <div className="thank-you__section">
            <div className="thank-you__number">02</div>

            <div>
              <h2>Свяжусь с вами</h2>
              <p>По указанным контактам</p>
            </div>
          </div>

          <div className="thank-you__section">
            <div className="thank-you__number">03</div>

            <div>
              <h2>Обсудим дальнейшие шаги</h2>
              <p>Отвечу на вопросы и расскажу о дальнейшем сотрудничестве</p>
            </div>
          </div>

          <p className="thank-you__important">
            <strong>Важно:</strong> заполнение анкеты ни к чему вас не обязывает
          </p>
        </div>

        <Link to="/" className="thank-you__button">
          Вернуться на сайт
        </Link>
      </div>
    </main>
  );
}
