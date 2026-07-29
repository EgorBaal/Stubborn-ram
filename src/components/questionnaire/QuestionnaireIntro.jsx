import "./Questionnaire.css";
import "../../styles/page-transition.css";

export default function QuestionnaireIntro({
  onStart,
  onContinue,
  hasSavedQuestionnaire,
}) {
  return (
    <div className="questionnaire page-transition">
      <div className="questionnaire-card">
        <div className="questionnaire-intro-content">
          <h1>Онлайн-сопровождение</h1>

          <p>Спасибо за интерес к моей системе онлайн-сопровождения.</p>

          <p>
            Перед началом работы я прошу каждого заполнить небольшую заявку. Это
            поможет мне лучше понять ваши цели, текущую ситуацию и определить,
            подойдет ли вам мой формат работы.
          </p>

          <div className="questionnaire-time">
            ⏱ Заполнение займет около <strong>2–3 минут</strong>
          </div>
        </div>

        <div className="questionnaire-intro-actions">
          {hasSavedQuestionnaire ? (
            <>
              <button className="questionnaire-button" onClick={onContinue}>
                Продолжить заполнение
              </button>

              <button
                className="questionnaire-button questionnaire-button-secondary"
                onClick={onStart}
              >
                Начать заново
              </button>
            </>
          ) : (
            <button className="questionnaire-button" onClick={onStart}>
              Начать
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
