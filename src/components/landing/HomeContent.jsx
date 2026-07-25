import aboutImage from "../../assets/obo-mne.png";
import Reveal from "./Reveal";
import SupportCarousel from "./SupportCarousel";
import FAQ from "./FAQ";
import BeforeAfter from "./BeforeAfter";
import Pricing from "./Pricing";
import Socials from "./Socials";

function HomeContent() {
  return (
    <>
      <div className="bottomButtons">
        <Reveal>
          <h2 className="sectionTitle aboutTitle">Кто стоит за Stubborn Ram</h2>
        </Reveal>

        <Reveal delay={150}>
          <div className="aboutFrame">
            <img
              src={aboutImage}
              alt="Георгий Балухин"
              className="aboutImage"
            />
          </div>
        </Reveal>

        <Reveal delay={250}>
          <p className="faithText">Иисус Христос — Господь и Спаситель</p>
        </Reveal>

        <Reveal>
          <h2 className="sectionTitle">Как проходит сопровождение</h2>
        </Reveal>

        <Reveal delay={150}>
          <SupportCarousel />
        </Reveal>

        <Reveal>
          <h2 className="sectionTitle">Вопросы и ответы</h2>
        </Reveal>

        <Reveal delay={150}>
          <FAQ />
        </Reveal>

        <Reveal>
          <h2 className="sectionTitle">Результаты клиентов</h2>
        </Reveal>

        <Reveal delay={120}>
          <BeforeAfter />
        </Reveal>

        <Reveal delay={180}>
          <Pricing />
        </Reveal>

        <Reveal delay={360}>
          <Socials />
        </Reveal>
      </div>
    </>
  );
}

export default HomeContent;
