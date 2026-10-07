import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";

import "./ActivityPage.css";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function pad(value) {
  return String(value).padStart(2, "0");
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getLocalDateKey(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}

function parseLocalDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getWeekDays(date) {
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = addDays(date, -mondayOffset);

  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function formatMonthYear(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatFullDate(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthGrid(date) {
  const monthStart = startOfMonth(date);
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  const monthStartWeekday = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -monthStartWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const day = addDays(gridStart, index);

    return {
      date: day,
      dateKey: getLocalDateKey(day),
      inCurrentMonth: day.getMonth() === date.getMonth(),
      inDisplayRange:
        day >= monthStart &&
        day <= addDays(monthStart, Math.max(daysInMonth - 1, 0)),
    };
  });
}

function useLockBodyScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLocked]);
}

function Overlay({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="activity-overlay" role="presentation" onClick={onClose}>
      <div
        className="activity-overlay__panel"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="activity-overlay__header">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          <button
            type="button"
            className="activity-overlay__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className="activity-overlay__body">{children}</div>

        {footer ? (
          <footer className="activity-overlay__footer">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}

function MonthPicker({ selectedDateKey, onPick, onClose }) {
  const [displayMonth, setDisplayMonth] = useState(() =>
    parseLocalDateKey(selectedDateKey),
  );

  const monthLabel = formatMonthYear(displayMonth);
  const monthGrid = useMemo(() => getMonthGrid(displayMonth), [displayMonth]);
  const todayKey = getLocalDateKey(new Date());

  return (
    <Overlay title="Выберите дату" subtitle={monthLabel} onClose={onClose}>
      <div className="activity-month-picker">
        <div className="activity-month-picker__nav">
          <button
            type="button"
            onClick={() => setDisplayMonth((prev) => addMonths(prev, -1))}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>

          <strong>{monthLabel}</strong>

          <button
            type="button"
            onClick={() => setDisplayMonth((prev) => addMonths(prev, 1))}
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="activity-month-picker__weekdays" aria-hidden="true">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="activity-month-picker__grid">
          {monthGrid.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            const isToday = day.dateKey === todayKey;

            return (
              <button
                key={day.dateKey}
                type="button"
                className={`activity-month-picker__day ${day.inCurrentMonth ? "" : "is-outside"} ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""}`}
                onClick={() => onPick(day.dateKey)}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </Overlay>
  );
}

export default function ActivityPage() {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getLocalDateKey(today), [today]);

  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [periodGoal, setPeriodGoal] = useState(null);
  const [dailyPlans, setDailyPlans] = useState({});
  const [steps, setSteps] = useState({});
  const [cardio, setCardio] = useState({});
  const [extraActivities, setExtraActivities] = useState({});

  const [goalOpen, setGoalOpen] = useState(false);
  const [cardioOpen, setCardioOpen] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [addType, setAddType] = useState("");
  const [cardioTypeInput, setCardioTypeInput] = useState("");
  const [cardioDurationInput, setCardioDurationInput] = useState("");
  const [cardioCommentInput, setCardioCommentInput] = useState("");
  const [extraTitleInput, setExtraTitleInput] = useState("");
  const [extraDurationInput, setExtraDurationInput] = useState("");
  const [extraCommentInput, setExtraCommentInput] = useState("");

  const selectedDate = useMemo(
    () => parseLocalDateKey(selectedDateKey),
    [selectedDateKey],
  );
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const monthLabel = formatMonthYear(selectedDate);

  const selectedPlan = dailyPlans[selectedDateKey] || null;
  const selectedSteps = steps[selectedDateKey] || null;
  const selectedCardio = cardio[selectedDateKey] || [];
  const selectedExtras = extraActivities[selectedDateKey] || [];

  const stepsValue = selectedSteps?.value ?? 0;
  const stepsGoal = selectedSteps?.goal ?? null;
  const stepsProgress =
    stepsGoal && stepsGoal > 0
      ? Math.min(100, (stepsValue / stepsGoal) * 100)
      : 0;
  const stepsGoalLabel = stepsGoal ? `${stepsGoal}` : "цель не задана";
  const stepsSourceLabel = selectedSteps?.source || "Не подключён";

  const cardioTotalMinutes = selectedCardio.reduce(
    (sum, item) => sum + (Number.isFinite(item.duration) ? item.duration : 0),
    0,
  );

  const extraTotalMinutes = selectedExtras.reduce(
    (sum, item) => sum + (Number.isFinite(item.duration) ? item.duration : 0),
    0,
  );

  useLockBodyScroll(
    goalOpen || cardioOpen || extraOpen || addOpen || pickerOpen,
  );

  useEffect(() => {
    if (!addOpen) {
      setAddType("");
      setCardioTypeInput("");
      setCardioDurationInput("");
      setCardioCommentInput("");
      setExtraTitleInput("");
      setExtraDurationInput("");
      setExtraCommentInput("");
    }
  }, [addOpen]);

  const handleSaveCardio = () => {
    const duration = Number.parseInt(cardioDurationInput, 10);

    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    setCardio((previous) => {
      const list = previous[selectedDateKey]
        ? [...previous[selectedDateKey]]
        : [];

      return {
        ...previous,
        [selectedDateKey]: [
          ...list,
          {
            id: createId(),
            type: cardioTypeInput.trim(),
            duration,
            comment: cardioCommentInput.trim(),
          },
        ],
      };
    });

    setAddOpen(false);
  };

  const handleSaveExtra = () => {
    const duration = Number.parseInt(extraDurationInput, 10);

    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    setExtraActivities((previous) => {
      const list = previous[selectedDateKey]
        ? [...previous[selectedDateKey]]
        : [];

      return {
        ...previous,
        [selectedDateKey]: [
          ...list,
          {
            id: createId(),
            title: extraTitleInput.trim(),
            duration,
            comment: extraCommentInput.trim(),
          },
        ],
      };
    });

    setAddOpen(false);
  };

  return (
    <main className="activity-view">
      <header className="activity-topbar">
        <span className="activity-topbar__icon" aria-hidden="true">
          <Activity size={18} strokeWidth={2.1} />
        </span>

        <h1>Активность</h1>

        <button
          type="button"
          className="activity-topbar__action"
          onClick={() => setAddOpen(true)}
          aria-label="Добавить активность"
        >
          <Plus size={18} strokeWidth={2.4} />
        </button>
      </header>

      <section className="activity-content" aria-label="Содержимое активности">
        <div className="activity-content__inner">
          <article className="activity-calendar">
            <button
              type="button"
              className="activity-calendar__month"
              onClick={() => setPickerOpen(true)}
            >
              {monthLabel}
              <ChevronDown size={14} strokeWidth={2.4} />
            </button>

            <div className="activity-calendar__weekdays" aria-hidden="true">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div
              className="activity-calendar__days"
              role="tablist"
              aria-label="Выбор дня"
            >
              {weekDays.map((day) => {
                const dateKey = getLocalDateKey(day);
                const isSelected = dateKey === selectedDateKey;
                const isToday = dateKey === todayKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={`activity-calendar__day ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""}`}
                    onClick={() => setSelectedDateKey(dateKey)}
                    aria-pressed={isSelected}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </article>

          <button
            type="button"
            className="activity-row"
            onClick={() => setGoalOpen(true)}
          >
            <span className="activity-row__label">Цель периода</span>
            <span className="activity-row__value">
              {periodGoal?.title || "Не задана"}
            </span>
          </button>

          {selectedPlan ? (
            <article className="activity-row activity-row--plan">
              <span className="activity-row__label">План на сегодня</span>
              <span className="activity-row__value">{selectedPlan}</span>
            </article>
          ) : null}

          <article className="activity-steps" aria-label="Шаги">
            <div className="activity-steps__header">
              <h2>Шаги</h2>
              <span>{formatShortDate(selectedDate)}</span>
            </div>

            <div className="activity-steps__value">{stepsValue}</div>

            <p className="activity-steps__goal">/ {stepsGoalLabel}</p>

            <div className="activity-steps__progress" aria-hidden="true">
              <div style={{ width: `${stepsProgress}%` }} />
            </div>

            <div className="activity-steps__meta">
              <div>
                <span>Процент</span>
                <strong>{stepsProgress.toFixed(0)}%</strong>
              </div>
              <div>
                <span>Источник</span>
                <strong>{stepsSourceLabel}</strong>
              </div>
            </div>
          </article>

          <button
            type="button"
            className="activity-card"
            onClick={() => setCardioOpen(true)}
          >
            <div>
              <h3>Кардио</h3>
              <p>{cardioTotalMinutes} мин</p>
            </div>
            <small>
              {selectedCardio.length ? "Есть записи" : "План не задан"}
            </small>
          </button>

          <button
            type="button"
            className="activity-card"
            onClick={() => setExtraOpen(true)}
          >
            <div>
              <h3>Дополнительная активность</h3>
              <p>{extraTotalMinutes} мин</p>
            </div>
            <small>
              {selectedExtras.length
                ? `${selectedExtras.length} записей`
                : "Нет записей"}
            </small>
          </button>

          <button
            type="button"
            className="activity-primary-button"
            onClick={() => setAddOpen(true)}
          >
            + Добавить активность
          </button>
        </div>
      </section>

      {pickerOpen ? (
        <MonthPicker
          selectedDateKey={selectedDateKey}
          onPick={(dateKey) => {
            setSelectedDateKey(dateKey);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      {goalOpen ? (
        <Overlay
          title="Цель периода"
          subtitle={formatFullDate(selectedDate)}
          onClose={() => setGoalOpen(false)}
        >
          <div className="activity-empty">Не задана</div>
        </Overlay>
      ) : null}

      {cardioOpen ? (
        <Overlay
          title="Кардио"
          subtitle={formatFullDate(selectedDate)}
          onClose={() => setCardioOpen(false)}
        >
          {selectedCardio.length ? (
            <div className="activity-list">
              {selectedCardio.map((item) => (
                <article key={item.id} className="activity-list__item">
                  <strong>{item.type || "Кардио"}</strong>
                  <span>{item.duration} мин</span>
                  {item.comment ? <p>{item.comment}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="activity-empty">0 мин · План не задан</div>
          )}
        </Overlay>
      ) : null}

      {extraOpen ? (
        <Overlay
          title="Дополнительная активность"
          subtitle={formatFullDate(selectedDate)}
          onClose={() => setExtraOpen(false)}
        >
          {selectedExtras.length ? (
            <div className="activity-list">
              {selectedExtras.map((item) => (
                <article key={item.id} className="activity-list__item">
                  <strong>{item.title || "Активность"}</strong>
                  <span>{item.duration} мин</span>
                  {item.comment ? <p>{item.comment}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="activity-empty">0 мин · Нет записей</div>
          )}
        </Overlay>
      ) : null}

      {addOpen ? (
        <Overlay
          title="Добавить активность"
          subtitle={formatFullDate(selectedDate)}
          onClose={() => setAddOpen(false)}
        >
          {!addType ? (
            <div className="activity-chooser">
              <p>Что добавляем?</p>
              <button type="button" onClick={() => setAddType("cardio")}>
                Кардио
              </button>
              <button type="button" onClick={() => setAddType("extra")}>
                Дополнительная активность
              </button>
            </div>
          ) : addType === "cardio" ? (
            <form
              className="activity-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveCardio();
              }}
            >
              <label>
                <span>Тип кардио</span>
                <input
                  type="text"
                  value={cardioTypeInput}
                  onChange={(event) => setCardioTypeInput(event.target.value)}
                  placeholder="Не задан"
                />
              </label>

              <label>
                <span>Длительность (мин)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={cardioDurationInput}
                  onChange={(event) =>
                    setCardioDurationInput(event.target.value)
                  }
                />
              </label>

              <label>
                <span>Комментарий</span>
                <textarea
                  value={cardioCommentInput}
                  onChange={(event) =>
                    setCardioCommentInput(event.target.value)
                  }
                  placeholder="Необязательно"
                />
              </label>

              <div className="activity-form__actions">
                <button type="button" onClick={() => setAddType("")}>
                  Назад
                </button>
                <button type="submit">Сохранить</button>
              </div>
            </form>
          ) : (
            <form
              className="activity-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveExtra();
              }}
            >
              <label>
                <span>Название</span>
                <input
                  type="text"
                  value={extraTitleInput}
                  onChange={(event) => setExtraTitleInput(event.target.value)}
                  placeholder="Не задано"
                />
              </label>

              <label>
                <span>Длительность (мин)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={extraDurationInput}
                  onChange={(event) =>
                    setExtraDurationInput(event.target.value)
                  }
                />
              </label>

              <label>
                <span>Комментарий</span>
                <textarea
                  value={extraCommentInput}
                  onChange={(event) => setExtraCommentInput(event.target.value)}
                  placeholder="Необязательно"
                />
              </label>

              <div className="activity-form__actions">
                <button type="button" onClick={() => setAddType("")}>
                  Назад
                </button>
                <button type="submit">Сохранить</button>
              </div>
            </form>
          )}
        </Overlay>
      ) : null}
    </main>
  );
}
