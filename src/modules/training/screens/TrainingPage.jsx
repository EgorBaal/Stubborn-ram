import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import "../styles/TrainingPage.css";
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);
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
          {isHistoryTraining && (
            <button type="button" className="training-builder-edit">
              Изменить
            </button>
          )}
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
      </section>
    </main>
  );
}
