import { useEffect, useRef, useState } from "react";

import "./TrainingInfo.css";

import DatePopover from "../popovers/DatePopover";
import TrainingTimePopover from "../popovers/TrainingTimePopover";
import TrainingTypePopover from "../popovers/TrainingTypePopover";

const trainingTypes = [
  "Силовая",
  "Интервальная",
  "Растяжка",
  "Реабилитация",
  "Йога",
  "Кардио",
];

export default function TrainingInfo({
  trainingTitle,
  setTrainingTitle,

  trainingDate,
  setTrainingDate,

  startTime,
  setStartTime,

  endTime,
  setEndTime,

  trainingType,
  setTrainingType,

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
  const trainingTypeButtonRef = useRef(null);
  const [isDateButtonOpen, setIsDateButtonOpen] = useState(false);
  const [isTrainingTypePickerOpen, setIsTrainingTypePickerOpen] =
    useState(false);

  const [isTrainingTypeButtonOpen, setIsTrainingTypeButtonOpen] =
    useState(false);
  const [isStartTimeButtonOpen, setIsStartTimeButtonOpen] = useState(false);
  const [isEndTimeButtonOpen, setIsEndTimeButtonOpen] = useState(false);

  useEffect(() => {
    if (!isDatePickerOpen) {
      setIsDateButtonOpen(false);
    }
  }, [isDatePickerOpen]);

  useEffect(() => {
    if (!isTrainingTypePickerOpen) {
      setIsTrainingTypeButtonOpen(false);
    }
  }, [isTrainingTypePickerOpen]);

  const handleDateToggle = () => {
    setIsTrainingTypePickerOpen(false);
    setIsTrainingTypeButtonOpen(false);
    setIsStartTimeButtonOpen(false);
    setIsEndTimeButtonOpen(false);
    setIsStartTimePickerOpen(false);
    setIsEndTimePickerOpen(false);

    const nextIsDatePickerOpen = !isDatePickerOpen;

    setIsDateButtonOpen(nextIsDatePickerOpen);
    setIsDatePickerOpen(nextIsDatePickerOpen);
  };

  const handleStartTimeToggle = () => {
    setIsTrainingTypePickerOpen(false);
    setIsTrainingTypeButtonOpen(false);
    setIsDatePickerOpen(false);
    setIsDateButtonOpen(false);
    setIsEndTimePickerOpen(false);

    const nextIsStartTimePickerOpen = !isStartTimePickerOpen;

    setIsEndTimeButtonOpen(false);
    setIsStartTimeButtonOpen(nextIsStartTimePickerOpen);
    setIsStartTimePickerOpen(nextIsStartTimePickerOpen);
  };

  const handleEndTimeToggle = () => {
    setIsTrainingTypePickerOpen(false);
    setIsTrainingTypeButtonOpen(false);
    setIsDatePickerOpen(false);
    setIsDateButtonOpen(false);
    setIsStartTimePickerOpen(false);

    const nextIsEndTimePickerOpen = !isEndTimePickerOpen;

    setIsStartTimeButtonOpen(false);
    setIsEndTimeButtonOpen(nextIsEndTimePickerOpen);
    setIsEndTimePickerOpen(nextIsEndTimePickerOpen);
  };

  const handleTrainingTypeToggle = () => {
    setIsDatePickerOpen(false);
    setIsDateButtonOpen(false);
    setIsStartTimeButtonOpen(false);
    setIsEndTimeButtonOpen(false);
    setIsStartTimePickerOpen(false);
    setIsEndTimePickerOpen(false);

    const nextIsTrainingTypePickerOpen = !isTrainingTypePickerOpen;

    setIsTrainingTypeButtonOpen(nextIsTrainingTypePickerOpen);
    setIsTrainingTypePickerOpen(nextIsTrainingTypePickerOpen);
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

  const calculateDuration = () => {
    if (!startTime || !endTime) {
      return "—";
    }

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    if (
      Number.isNaN(startHours) ||
      Number.isNaN(startMinutes) ||
      Number.isNaN(endHours) ||
      Number.isNaN(endMinutes)
    ) {
      return "—";
    }

    let startTotal = startHours * 60 + startMinutes;
    let endTotal = endHours * 60 + endMinutes;

    // Если тренировка заканчивается после полуночи.
    if (endTotal < startTotal) {
      endTotal += 24 * 60;
    }

    const duration = endTotal - startTotal;

    if (duration <= 0) {
      return "—";
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours === 0) {
      return `${minutes} мин`;
    }

    if (minutes === 0) {
      return `${hours} ч`;
    }

    return `${hours} ч ${minutes} мин`;
  };

  const trainingDuration = calculateDuration();

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
            onFocus={(e) => {
              const input = e.target;
              const length = input.value.length;

              requestAnimationFrame(() => {
                input.setSelectionRange(length, length);
              });
            }}
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
            className={`training-info__button training-info__button--date${isDateButtonOpen ? " training-info__button--open" : ""}`}
            onClick={handleDateToggle}
            aria-expanded={isDateButtonOpen}
          >
            {formattedTrainingDate}
          </button>
        </div>

        {isDatePickerOpen && (
          <DatePopover
            trainingDate={trainingDate}
            setTrainingDate={setTrainingDate}
            onCloseStart={() => setIsDateButtonOpen(false)}
            onClose={() => {
              setIsDateButtonOpen(false);
              setIsDatePickerOpen(false);
            }}
            anchorRef={dateButtonRef}
          />
        )}

        <div className="training-info__row">
          <span className="training-info__label">Время</span>

          <div className="training-info__time">
            <button
              ref={startTimeButtonRef}
              type="button"
              className={`training-info__button training-info__button--time${isStartTimeButtonOpen ? " training-info__button--open" : ""}`}
              onClick={handleStartTimeToggle}
              aria-expanded={isStartTimeButtonOpen}
            >
              {startTime}
            </button>

            <span className="training-info__dash">—</span>

            <button
              ref={endTimeButtonRef}
              type="button"
              className={`training-info__button training-info__button--time${isEndTimeButtonOpen ? " training-info__button--open" : ""}`}
              onClick={handleEndTimeToggle}
              aria-expanded={isEndTimeButtonOpen}
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
            onCloseStart={() => setIsStartTimeButtonOpen(false)}
            onClose={() => {
              setIsStartTimeButtonOpen(false);
              setIsStartTimePickerOpen(false);
            }}
          />
        )}

        {isEndTimePickerOpen && (
          <TrainingTimePopover
            anchorRef={endTimeButtonRef}
            value={endTime}
            onChange={setEndTime}
            onCloseStart={() => setIsEndTimeButtonOpen(false)}
            onClose={() => {
              setIsEndTimeButtonOpen(false);
              setIsEndTimePickerOpen(false);
            }}
          />
        )}

        <div className="training-info__row">
          <span className="training-info__label">Длительность</span>

          <span className="training-info__value">{trainingDuration}</span>
        </div>

        <div className="training-info__row training-info__row--type">
          <span className="training-info__label">Тип тренировки</span>

          <button
            ref={trainingTypeButtonRef}
            type="button"
            className={`training-info__button training-info__button--type${isTrainingTypeButtonOpen ? " training-info__button--open" : ""}`}
            onClick={handleTrainingTypeToggle}
            aria-expanded={isTrainingTypeButtonOpen}
          >
            {trainingType}
          </button>
        </div>

        {isTrainingTypePickerOpen && (
          <TrainingTypePopover
            anchorRef={trainingTypeButtonRef}
            options={trainingTypes}
            value={trainingType}
            onChange={setTrainingType}
            onCloseStart={() => setIsTrainingTypeButtonOpen(false)}
            onClose={() => {
              setIsTrainingTypeButtonOpen(false);
              setIsTrainingTypePickerOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
