export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  value,
  error,
  onChange,
  onBack,
  onNext,
  onExit,
}) {
  return (
    <div className="questionnaire">
      <div className="questionnaire-card">
        <div className="questionnaire-top">
          <button
            type="button"
            className="questionnaire-exit-button"
            onClick={onExit}
          >
            ← Вернуться на сайт
          </button>

          <div className="questionnaire-progress">
            <div className="questionnaire-progress-text">
              Вопрос {currentIndex + 1} из {totalQuestions}
            </div>

            <div className="questionnaire-progress-bar">
              <div
                className="questionnaire-progress-fill"
                style={{
                  width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="questionnaire-content">
          <h1>{question.title}</h1>

          {(question.type === "text" || question.type === "number") && (
            <input
              className="questionnaire-input"
              type={question.type === "number" ? "text" : "text"}
              inputMode={question.type === "number" ? "decimal" : "text"}
              placeholder={question.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          )}

          {question.type === "textarea" && (
            <textarea
              className="questionnaire-input questionnaire-textarea"
              placeholder={question.placeholder}
              value={value}
              rows={4}
              onChange={(e) => {
                onChange(e.target.value);

                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
          )}

          {question.type === "radio" && (
            <div className="questionnaire-radio-group">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`questionnaire-radio-button ${
                    value === option ? "active" : ""
                  }`}
                  onClick={() => onChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {error && <div className="questionnaire-error">{error}</div>}

          <div className="questionnaire-actions">
            <button
              type="button"
              className="questionnaire-back-button"
              onClick={onBack}
              disabled={currentIndex === 0}
            >
              ← Назад
            </button>

            <button
              type="button"
              className="questionnaire-button"
              onClick={onNext}
            >
              {currentIndex === totalQuestions - 1 ? "Отправить" : "Далее"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
