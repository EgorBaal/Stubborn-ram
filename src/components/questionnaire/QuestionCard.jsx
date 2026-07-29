import { IMaskInput } from "react-imask";
import { FaTelegramPlane, FaVk, FaInstagram } from "react-icons/fa";
import { Phone } from "lucide-react";
import "@/styles/page-transition.css";
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
    <div className="questionnaire page-transition">
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
              type={question.type === "number" ? "number" : "text"}
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

          {question.type === "checkbox" && (
            <>
              <div className="questionnaire-radio-group">
                {question.options.map((option) => {
                  const selected =
                    value &&
                    typeof value === "object" &&
                    Array.isArray(value.selected)
                      ? value.selected
                      : [];

                  return (
                    <button
                      key={option}
                      type="button"
                      className={`questionnaire-radio-button ${
                        selected.includes(option) ? "active" : ""
                      }`}
                      onClick={() =>
                        onChange((prev) => {
                          const selected = Array.isArray(prev?.selected)
                            ? prev.selected
                            : [];

                          const exists = selected.includes(option);

                          return {
                            selected: exists
                              ? selected.filter((item) => item !== option)
                              : [...selected, option],
                            details: prev?.details ?? "",
                          };
                        })
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <textarea
                className="questionnaire-input questionnaire-textarea"
                placeholder={question.detailsPlaceholder}
                value={
                  value && typeof value === "object"
                    ? (value.details ?? "")
                    : ""
                }
                rows={3}
                onChange={(e) =>
                  onChange((prev) => ({
                    selected: Array.isArray(prev?.selected)
                      ? prev.selected
                      : [],
                    details: e.target.value,
                  }))
                }
              />
            </>
          )}

          {question.type === "radioWithDetails" && (
            <>
              <div className="questionnaire-radio-group">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`questionnaire-radio-button ${
                      (value && typeof value === "object"
                        ? value.selected
                        : "") === option
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      onChange((prev) => ({
                        selected: option,
                        details: prev?.details ?? "",
                      }))
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>

              <textarea
                className="questionnaire-input questionnaire-textarea"
                placeholder={question.detailsPlaceholder}
                value={
                  value && typeof value === "object"
                    ? (value.details ?? "")
                    : ""
                }
                rows={3}
                onChange={(e) =>
                  onChange((prev) => ({
                    selected: prev?.selected ?? "",
                    details: e.target.value,
                  }))
                }
              />
            </>
          )}
          {question.type === "contacts" && (
            <>
              <p className="questionnaire-contact-info">
                Номер телефона обязателен. Также укажите хотя бы один удобный
                способ связи. Эти данные используются только для связи с вами по
                поводу онлайн-сопровождения.
              </p>

              <div className="questionnaire-contacts">
                <div className="contact-input">
                  <div className="contact-icon">
                    <FaTelegramPlane />
                  </div>

                  <input
                    className="questionnaire-input"
                    type="text"
                    autoComplete="off"
                    placeholder="@username"
                    value={value?.telegram ?? ""}
                    onChange={(e) =>
                      onChange((prev = {}) => ({
                        ...prev,
                        telegram: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="contact-input">
                  <div className="contact-icon">
                    <FaVk />
                  </div>

                  <input
                    className="questionnaire-input"
                    type="text"
                    placeholder="id123456 или vk.com/..."
                    value={value?.vk ?? ""}
                    onChange={(e) =>
                      onChange((prev = {}) => ({
                        ...prev,
                        vk: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="contact-input">
                  <div className="contact-icon">
                    <FaInstagram />
                  </div>

                  <input
                    className="questionnaire-input"
                    type="text"
                    placeholder="@instagram"
                    value={value?.instagram ?? ""}
                    onChange={(e) =>
                      onChange((prev = {}) => ({
                        ...prev,
                        instagram: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="contact-input">
                  <div className="contact-icon">
                    <Phone size={20} />
                  </div>

                  {value?.isForeign ? (
                    <input
                      className="questionnaire-input"
                      type="tel"
                      autoComplete="off"
                      placeholder="+49 176 12345678"
                      value={value?.foreignPhone ?? ""}
                      onChange={(e) =>
                        onChange((prev = {}) => ({
                          ...prev,
                          foreignPhone: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <IMaskInput
                      className="questionnaire-input"
                      type="tel"
                      inputMode="numeric"
                      mask="+{7} (000) 000-00-00"
                      lazy={false}
                      overwrite
                      placeholder="+7 (___) ___-__-__"
                      value={value?.phone ?? ""}
                      onAccept={(valueMask) =>
                        onChange((prev = {}) => ({
                          ...prev,
                          phone: valueMask,
                        }))
                      }
                    />
                  )}
                </div>

                <label className="foreign-phone-checkbox">
                  <input
                    className="foreign-phone-checkbox-input"
                    type="checkbox"
                    checked={value?.isForeign ?? false}
                    onChange={(e) =>
                      onChange((prev = {}) => ({
                        ...prev,
                        isForeign: e.target.checked,
                      }))
                    }
                  />

                  <span className="foreign-phone-checkbox-custom"></span>

                  <span className="foreign-phone-checkbox-text">
                    Другой формат телефона
                  </span>
                </label>

                <div className="questionnaire-contact-note">
                  Контактные данные используются только для связи с вами и не
                  передаются третьим лицам.
                </div>
              </div>
            </>
          )}

          {error && <div className="questionnaire-error">{error}</div>}
        </div>

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
            onClick={(e) => {
              e.currentTarget.blur();
              onNext();
            }}
          >
            {currentIndex === totalQuestions - 1 ? "Отправить" : "Далее"}
          </button>
        </div>
      </div>
    </div>
  );
}
