import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import "../styles/TrainingPage.css";
import TrainingExerciseCard from "../components/cards/TrainingExerciseCard";
import TrainingComment from "../components/comment/TrainingComment";
import TrainingInfo from "../components/info/TrainingInfo";

export default function TrainingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isTemplateTraining = location.pathname.startsWith(
    "/app/training/template/",
  );

  const isHistoryTraining = Boolean(id) && !isTemplateTraining;

  const [trainingTitle, setTrainingTitle] = useState("Новая тренировка");
  const [trainingDate, setTrainingDate] = useState(new Date());

  const [startTime, setStartTime] = useState(() =>
    new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  const [endTime, setEndTime] = useState("");
  const [trainingType, setTrainingType] = useState("Силовая");
  const [trainingComment, setTrainingComment] = useState("");

  const [exerciseCards, setExerciseCards] = useState([]);
  const [addButtonRipple, setAddButtonRipple] = useState(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

  const handleAddExercise = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setAddButtonRipple({
      x,
      y,
      id: Date.now(),
    });

    setTimeout(() => {
      setExerciseCards((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
        },
      ]);

      setAddButtonRipple(null);
    }, 180);
  };

  return (
    <main className="training-builder-view">
      <header className="training-builder-topbar">
        <div className="training-builder-side">
          <button
            type="button"
            className="training-builder-back"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
        </div>

        <h1 className="training-builder-title">{trainingTitle}</h1>

        <div className="training-builder-side">
          <button type="button" className="training-builder-edit">
            Завершить
          </button>
        </div>
      </header>

      <section className="training-builder-content" aria-label="Тренировка">
        <TrainingInfo
          trainingTitle={trainingTitle}
          setTrainingTitle={setTrainingTitle}
          trainingDate={trainingDate}
          setTrainingDate={setTrainingDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          trainingType={trainingType}
          setTrainingType={setTrainingType}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
          isStartTimePickerOpen={isStartTimePickerOpen}
          setIsStartTimePickerOpen={setIsStartTimePickerOpen}
          isEndTimePickerOpen={isEndTimePickerOpen}
          setIsEndTimePickerOpen={setIsEndTimePickerOpen}
        />

        <TrainingComment
          value={trainingComment}
          onChange={setTrainingComment}
        />

        {exerciseCards.map((exercise, index) => (
          <TrainingExerciseCard key={exercise.id} exerciseNumber={index + 1} />
        ))}

        <button
          type="button"
          className="training-exercise-add-button"
          onClick={handleAddExercise}
        >
          {addButtonRipple && (
            <span
              key={addButtonRipple.id}
              className="training-exercise-add-button__ripple"
              style={{
                left: `${addButtonRipple.x}px`,
                top: `${addButtonRipple.y}px`,
              }}
            />
          )}

          <span className="training-exercise-add-button__text">
            Добавить упражнение
          </span>
        </button>
      </section>
    </main>
  );
}
