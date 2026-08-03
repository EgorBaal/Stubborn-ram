import { useNavigate } from "react-router-dom";

import logo from "../../assets/obshee-logo.png";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="topBar hero-topbar">
        <button className="topButton">Регистрация</button>

        <button className="topButton" onClick={() => navigate("/app/home")}>
          Вход
        </button>
      </div>

      <img src={logo} alt="Stubborn Ram" className="logo hero-logo" />

      <h2 className="heroTitle hero-title">
        Экосистема
        <span>натурального бодибилдинга</span>
      </h2>

      <div className="heroFeatures">
        <div className="heroDivider"></div>

        <div className="featureCard feature-1">
          <div className="featureTitle">Полное онлайн-сопровождение</div>

          <div className="featureText">
            Все аспекты прогресса — под контролем
          </div>
        </div>

        <div className="featureCard feature-2">
          <div className="featureTitle">Индивидуальная стратегия</div>

          <div className="featureText">
            Без шаблонов. Под ваши цели и возможности
          </div>
        </div>

        <div className="featureCard feature-3">
          <div className="featureTitle">Научный подход</div>

          <div className="featureText">
            Основано на современных исследованиях
          </div>
        </div>

        <div className="featureCard feature-4">
          <div className="featureTitle">Всё в одном приложении</div>

          <div className="featureText">
            План, коммуникация и прогресс — в одном месте
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
