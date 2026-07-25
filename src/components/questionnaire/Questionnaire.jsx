import { useState } from "react";
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

  const navigate = useNavigate();

  const currentQuestion = questions[currentIndex];

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));

    if (error) {
      setError("");
    }
  };

  if (!started) {
    return <QuestionnaireIntro onStart={() => setStarted(true)} />;
  }

  return (
    <>
      <QuestionCard
        question={currentQuestion}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        value={answers[currentQuestion.id] || ""}
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

          if (
            currentQuestion.required &&
            (!value || String(value).trim() === "")
          ) {
            setError("Пожалуйста, заполните это поле.");
            return;
          }

          setError("");

          if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            console.log(answers);
          }
        }}
      />

      <ConfirmModal
        open={showExitModal}
        title="Выйти из анкеты?"
        message="Все заполненные ответы будут потеряны."
        confirmText="Выйти"
        cancelText="Остаться"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => navigate("/")}
      />
    </>
  );
}
