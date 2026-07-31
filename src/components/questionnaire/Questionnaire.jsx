import { useEffect, useState } from "react";
import { createLead } from "@/services/leadService";
import { useNavigate } from "react-router-dom";

import QuestionnaireIntro from "./QuestionnaireIntro";
import QuestionCard from "./QuestionCard";
import ConfirmModal from "../ui/ConfirmModal";

import { questions } from "./questions";

export default function Questionnaire() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSavedQuestionnaire, setHasSavedQuestionnaire] = useState(false);
  const [animateFirstQuestion, setAnimateFirstQuestion] = useState(true);

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
  function buildLeadFromAnswers(answers) {
    return {
      full_name: answers[1] ?? "",
      age: Number(answers[2]),
      height: Number(answers[3]),
      weight: Number(answers[4]),

      goals: answers[5]?.selected ?? [],
      goal_details: answers[5]?.details ?? "",

      training_experience: answers[6]?.selected ?? "",
      training_experience_details: answers[6]?.details ?? "",

      difficulties: answers[7]?.selected ?? [],
      difficulties_details: answers[7]?.details ?? "",

      ideal_results: answers[8]?.selected ?? [],
      ideal_result_details: answers[8]?.details ?? "",

      report_preferences: answers[9]?.selected ?? [],
      report_preferences_details: answers[9]?.details ?? "",

      telegram: answers[10]?.telegram ?? "",
      vk: answers[10]?.vk ?? "",
      instagram: answers[10]?.instagram ?? "",

      phone: answers[10]?.isForeign
        ? (answers[10]?.foreignPhone ?? "")
        : (answers[10]?.phone ?? ""),
    };
  }

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
          setAnimateFirstQuestion(true);
        }}
        onContinue={() => {
          setStarted(true);
          setAnimateFirstQuestion(true);
        }}
      />
    );
  }

  return (
    <>
      <QuestionCard
        animate={animateFirstQuestion}
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
                    foreignPhone: "",
                    isForeign: false,
                  }
                : "")
        }
        error={error}
        isSubmitting={isSubmitting}
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
              const hasSelected = (value?.selected?.length ?? 0) > 0;
              const hasDetails = (value?.details ?? "").trim() !== "";

              if (!hasSelected && !hasDetails) {
                setError(
                  "Выберите хотя бы один вариант или опишите подробнее.",
                );
                return;
              }
            } else if (currentQuestion.type === "radioWithDetails") {
              const hasSelected = (value?.selected ?? "").trim() !== "";
              const hasDetails = (value?.details ?? "").trim() !== "";
              if (!hasSelected && !hasDetails) {
                setError(
                  "Выберите вариант ответа или расскажите немного подробнее.",
                );
                return;
              }
            } else if (currentQuestion.type === "contacts") {
              const phone = value?.phone ?? "";
              const foreignPhone = value?.foreignPhone ?? "";
              const isForeign = value?.isForeign ?? false;

              const digits = phone.replace(/\D/g, "");

              const hasMessenger =
                (value?.telegram?.trim() ?? "") !== "" ||
                (value?.vk?.trim() ?? "") !== "" ||
                (value?.instagram?.trim() ?? "") !== "";

              if (isForeign) {
                if (foreignPhone.trim() === "") {
                  setError("Введите номер телефона.");
                  return;
                }
              } else {
                if (digits.length !== 11) {
                  setError("Введите корректный номер телефона.");
                  return;
                }
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
            (async () => {
              try {
                setIsSubmitting(true);

                const lead = buildLeadFromAnswers(answers);

                await createLead(lead);

                localStorage.removeItem("sr-questionnaire");
                setHasSavedQuestionnaire(false);

                navigate("/questionnaire/thank-you");
              } catch (err) {
                console.error(err);
                setError("Не удалось отправить анкету. Попробуйте еще раз.");
              } finally {
                setIsSubmitting(false);
              }
            })();
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
