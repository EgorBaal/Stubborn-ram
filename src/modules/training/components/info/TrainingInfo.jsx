import { useRef } from "react";

import "./TrainingInfo.css";

import DatePopover from "../popovers/DatePopover";
import TrainingTimePopover from "../popovers/TrainingTimePopover";

export default function TrainingInfo({
  trainingTitle,
  setTrainingTitle,

  trainingDate,
  setTrainingDate,

  startTime,
  setStartTime,

  endTime,
  setEndTime,

  isDatePickerOpen,
  setIsDatePickerOpen,

  isStartTimePickerOpen,
  setIsStartTimePickerOpen,

  isEndTimePickerOpen,
  setIsEndTimePickerOpen,
}) {
  const dateButtonRef = useRef(null);
  const startTimeButtonRef = useRef(null);
  const endTimeButtonRef = useRef(null);

  const handleDateToggle = () => {
    setIsStartTimePickerOpen(false);
    setIsEndTimePickerOpen(false);
    setIsDatePickerOpen((prev) => !prev);
  };

  const handleStartTimeToggle = () => {
    setIsDatePickerOpen(false);
    setIsEndTimePickerOpen(false);
    setIsStartTimePickerOpen((prev) => !prev);
  };

  const handleEndTimeToggle = () => {
    setIsDatePickerOpen(false);
    setIsStartTimePickerOpen(false);
    setIsEndTimePickerOpen((prev) => !prev);
  };

  const formattedTrainingDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .formatToParts(trainingDate)
    .map((part) => {
      if (part.type !== "month") {
        return part.value;
      }

      return part.value.charAt(0).toUpperCase() + part.value.slice(1);
    })
    .join("");

  return (
    <div className="training-info">
      <h2 className="training-info__title">Информация</h2>

      <div className="training-info__card">
        <div className="training-info__row">
          <span className="training-info__label">Название</span>

          <input
            className="training-info__input"
            value={trainingTitle}
            maxLength={60}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setTrainingTitle(e.target.value)}
            onBlur={() => {
              if (trainingTitle.trim() === "") {
                setTrainingTitle("Новая тренировка");
              }
            }}
          />
        </div>

        <div className="training-info__row">
          <span className="training-info__label">Дата</span>

          <button
            ref={dateButtonRef}
            type="button"
            className="training-info__button training-info__button--date"
            onClick={handleDateToggle}
          >
            {formattedTrainingDate}
          </button>
        </div>

        {isDatePickerOpen && (
          <DatePopover
            trainingDate={trainingDate}
            setTrainingDate={setTrainingDate}
            onClose={() => setIsDatePickerOpen(false)}
            anchorRef={dateButtonRef}
          />
        )}

        <div className="training-info__row">
          <span className="training-info__label">Время</span>

          <div className="training-info__time">
            <button
              ref={startTimeButtonRef}
              type="button"
              className="training-info__button training-info__button--time"
              onClick={handleStartTimeToggle}
            >
              {startTime}
            </button>

            <span className="training-info__dash">—</span>

            <button
              ref={endTimeButtonRef}
              type="button"
              className="training-info__button training-info__button--time"
              onClick={handleEndTimeToggle}
            >
              {endTime || "--:--"}
            </button>
          </div>
        </div>

        {isStartTimePickerOpen && (
          <TrainingTimePopover
            anchorRef={startTimeButtonRef}
            value={startTime}
            onChange={setStartTime}
            onClose={() => setIsStartTimePickerOpen(false)}
          />
        )}

        {isEndTimePickerOpen && (
          <TrainingTimePopover
            anchorRef={endTimeButtonRef}
            value={endTime}
            onChange={setEndTime}
            onClose={() => setIsEndTimePickerOpen(false)}
          />
        )}

        <div className="training-info__row">
          <span className="training-info__label">Длительность</span>

          <span className="training-info__value">—</span>
        </div>

        <div className="training-info__row">
          <span className="training-info__label">Тип тренировки</span>

          <span className="training-info__value">Силовая</span>
        </div>
      </div>
    </div>
  );
}
