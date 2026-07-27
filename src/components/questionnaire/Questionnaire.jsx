import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import QuestionnaireIntro from "./QuestionnaireIntro";
import QuestionCard from "./QuestionCard";
import ConfirmModal from "../ui/ConfirmModal";

import { questions } from "./questions";

export default function Questionnaire() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSavedQuestionnaire, setHasSavedQuestionnaire] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("sr-questionnaire");

    if (saved) {
      setHasSavedQuestionnaire(true);

      try {
        const data = JSON.parse(saved);

        setStarted(false);
        setCurrentIndex(data.currentIndex ?? 0);
        setAnswers(data.answers ?? {});
      } catch (e) {
        console.error("Ошибка восстановления анкеты:", e);
        localStorage.removeItem("sr-questionnaire");
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(
      "sr-questionnaire",
      JSON.stringify({
        started,
        currentIndex,
        answers,
      }),
    );
  }, [started, currentIndex, answers, isLoaded]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]:
        typeof value === "function" ? value(prev[currentQuestion.id]) : value,
    }));

    if (error) {
      setError("");
    }
  };

  if (!started) {
    return (
      <QuestionnaireIntro
        hasSavedQuestionnaire={hasSavedQuestionnaire}
        onStart={() => {
          localStorage.removeItem("sr-questionnaire");
          setHasSavedQuestionnaire(false);
          setAnswers({});
          setCurrentIndex(0);
          setStarted(true);
        }}
        onContinue={() => {
          setStarted(true);
        }}
      />
    );
  }

  return (
    <>
      <QuestionCard
        question={currentQuestion}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        value={
          answers[currentQuestion.id] ??
          (currentQuestion.type === "checkbox"
            ? { selected: [], details: "" }
            : currentQuestion.type === "radioWithDetails"
              ? { selected: "", details: "" }
              : currentQuestion.type === "contacts"
                ? {
                    telegram: "",
                    vk: "",
                    instagram: "",
                    phone: "",
                  }
                : "")
        }
        error={error}
        onChange={handleAnswerChange}
        onExit={() => setShowExitModal(true)}
        onBack={() => {
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
        }}
        onNext={() => {
          const value = answers[currentQuestion.id];

          if (currentQuestion.required) {
            if (currentQuestion.type === "checkbox") {
              const hasSelected = value?.selected?.length > 0;
              const hasDetails = value?.details?.trim() !== "";

              if (!hasSelected && !hasDetails) {
                setError(
                  "Выберите хотя бы один вариант или опишите подробнее.",
                );
                return;
              }
            } else if (currentQuestion.type === "radioWithDetails") {
              const hasSelected = value?.selected?.trim() !== "";
              const hasDetails = value?.details?.trim() !== "";

              if (!hasSelected && !hasDetails) {
                setError(
                  "Выберите вариант ответа или расскажите немного подробнее.",
                );
                return;
              }
            } else if (currentQuestion.type === "contacts") {
              const phone = value?.phone ?? "";

              const hasMessenger =
                (value?.telegram?.trim() ?? "") !== "" ||
                (value?.vk?.trim() ?? "") !== "" ||
                (value?.instagram?.trim() ?? "") !== "";

              // Маска считается заполненной только если не осталось символов "_"
              const digits = phone.replace(/\D/g, "");

              if (digits.length !== 11) {
                setError("Введите корректный номер телефона.");
                return;
              }

              if (!hasMessenger) {
                setError(
                  "Укажите хотя бы один способ связи: Telegram, ВКонтакте или Instagram.",
                );
                return;
              }
            } else {
              const text = String(value || "").trim();

              if (text === "") {
                setError("Пожалуйста, заполните это поле.");
                return;
              }

              if (currentQuestion.id === 1) {
                const words = text.split(/\s+/);

                if (words.length < 2) {
                  setError("Пожалуйста, укажите фамилию и имя.");
                  return;
                }
              }
            }
          }

          setError("");

          if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            localStorage.removeItem("sr-questionnaire");
            setHasSavedQuestionnaire(false);

            console.log(answers);
          }
        }}
      />

      <ConfirmModal
        open={showExitModal}
        title="Выйти из анкеты?"
        message="Ответы сохраняются автоматически. Вы сможете продолжить заполнение позже."
        confirmText="Выйти"
        cancelText="Остаться"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => navigate("/")}
      />
    </>
  );
}
