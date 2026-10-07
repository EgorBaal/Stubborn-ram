import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Plus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./NutritionPage.css";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const NUTRITION_METRICS = [
  { key: "calories", label: "Калории", unit: "ккал", badge: "К" },
  { key: "protein", label: "Белки", unit: "г", badge: "Б" },
  { key: "fat", label: "Жиры", unit: "г", badge: "Ж" },
  { key: "carbs", label: "Углеводы", unit: "г", badge: "У" },
  { key: "water", label: "Вода", unit: "л", badge: "В" },
  { key: "salt", label: "Соль", unit: "г", badge: "С" },
];

const MANUAL_FIELDS = [
  { key: "calories", label: "Калории", unit: "ккал", type: "number" },
  { key: "protein", label: "Белки", unit: "г", type: "number" },
  { key: "fat", label: "Жиры", unit: "г", type: "number" },
  { key: "carbs", label: "Углеводы", unit: "г", type: "number" },
  { key: "water", label: "Вода", unit: "л", type: "number", step: "0.1" },
  { key: "salt", label: "Соль", unit: "г", type: "number", step: "0.1" },
];

const INITIAL_MANUAL_VALUES = MANUAL_FIELDS.reduce((accumulator, field) => {
  accumulator[field.key] = "";
  return accumulator;
}, {});

function pad(value) {
  return String(value).padStart(2, "0");
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

function formatMetricValue(value, unit) {
  return unit ? `${value} ${unit}` : String(value);
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
    <div className="nutrition-overlay" role="presentation" onClick={onClose}>
      <div
        className="nutrition-overlay__panel"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="nutrition-overlay__header">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          <button
            type="button"
            className="nutrition-overlay__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className="nutrition-overlay__body">{children}</div>

        {footer ? (
          <footer className="nutrition-overlay__footer">{footer}</footer>
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
      <div className="nutrition-month-picker">
        <div className="nutrition-month-picker__nav">
          <button
            type="button"
            onClick={() =>
              setDisplayMonth((previous) => addMonths(previous, -1))
            }
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>

          <strong>{monthLabel}</strong>

          <button
            type="button"
            onClick={() =>
              setDisplayMonth((previous) => addMonths(previous, 1))
            }
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="nutrition-month-picker__weekdays" aria-hidden="true">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="nutrition-month-picker__grid">
          {monthGrid.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            const isToday = day.dateKey === todayKey;

            return (
              <button
                key={day.dateKey}
                type="button"
                className={`nutrition-month-picker__day ${day.inCurrentMonth ? "" : "is-outside"} ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""}`}
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

function MetricOverlay({ metric, factValue, planValue, onClose }) {
  return (
    <Overlay title={metric.label} subtitle="План ↔ факт" onClose={onClose}>
      <div className="nutrition-empty-state">
        <strong>{formatMetricValue(factValue, metric.unit)}</strong>
        <span>
          {planValue === null
            ? "План не задан"
            : `${formatMetricValue(planValue, metric.unit)} · план`}
        </span>
        <p>
          {planValue === null
            ? "Для этого дня план пока не назначен."
            : "Скоро здесь появится сравнение факта с планом."}
        </p>
      </div>
    </Overlay>
  );
}

function GoalOverlay({ onClose }) {
  return (
    <Overlay title="Цель периода" subtitle="План питания" onClose={onClose}>
      <div className="nutrition-empty-state">
        <strong>Не задана</strong>
        <span>Пока не создан активный период питания.</span>
        <p>
          Здесь появятся название периода, сроки, КБЖУ, вода, соль, рекомендации
          и комментарии.
        </p>
      </div>
    </Overlay>
  );
}

function ManualEntryOverlay({
  selectedDate,
  values,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <Overlay
      title="Ввести вручную"
      subtitle={formatFullDate(selectedDate)}
      onClose={onClose}
    >
      <form
        className="nutrition-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {MANUAL_FIELDS.map((field) => (
          <label key={field.key}>
            <span>{field.label}</span>
            <input
              type={field.type}
              min="0"
              step={field.step || "1"}
              inputMode="decimal"
              value={values[field.key]}
              onChange={(event) => onChange(field.key, event.target.value)}
              placeholder="0"
            />
          </label>
        ))}

        <div className="nutrition-form__actions">
          <button type="button" onClick={onClose}>
            Отмена
          </button>
          <button type="submit">Сохранить</button>
        </div>
      </form>
    </Overlay>
  );
}

function PlaceholderOverlay({ title, subtitle, message, onClose }) {
  return (
    <Overlay title={title} subtitle={subtitle} onClose={onClose}>
      <div className="nutrition-empty-state">
        <strong>Интеграция пока недоступна</strong>
        <span>{message}</span>
        <p>Этот экран подготовлен только как frontend-only заглушка.</p>
      </div>
    </Overlay>
  );
}

function FoodDetailsBlock({ isOpen, onToggle, foodDetails }) {
  return (
    <article className="nutrition-food" aria-label="Данные питания">
      <button
        type="button"
        className="nutrition-food__header"
        onClick={onToggle}
      >
        <div>
          <span className="nutrition-section-label">Данные питания</span>
          <strong>
            {foodDetails.length
              ? `${foodDetails.length} записей`
              : "Нет записей"}
          </strong>
        </div>

        <span className={`nutrition-food__chevron ${isOpen ? "is-open" : ""}`}>
          <ChevronDown size={16} strokeWidth={2.5} />
        </span>
      </button>

      {isOpen ? (
        <div className="nutrition-food__body">
          {foodDetails.length ? (
            <div className="nutrition-food__empty">
              Записи появятся здесь позже.
            </div>
          ) : (
            <div className="nutrition-food__empty">Нет записей</div>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default function NutritionPage() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getLocalDateKey(today), [today]);

  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [periodPlan] = useState(null);
  const [dailyAssignmentsByDate] = useState({});
  const [nutritionFactsByDate, setNutritionFactsByDate] = useState({});
  const [foodDetailsByDate] = useState({});

  const [goalOpen, setGoalOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [fatSecretOpen, setFatSecretOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [foodDetailsOpen, setFoodDetailsOpen] = useState(false);
  const [addChooserOpen, setAddChooserOpen] = useState(false);
  const [metricKeyOpen, setMetricKeyOpen] = useState(null);

  const [manualValues, setManualValues] = useState(INITIAL_MANUAL_VALUES);

  const selectedDate = useMemo(
    () => parseLocalDateKey(selectedDateKey),
    [selectedDateKey],
  );
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const monthLabel = formatMonthYear(selectedDate);

  const selectedAssignment = dailyAssignmentsByDate[selectedDateKey] || null;
  const selectedFacts = nutritionFactsByDate[selectedDateKey] || null;
  const selectedFoodDetails = foodDetailsByDate[selectedDateKey] || [];

  useLockBodyScroll(
    goalOpen ||
      manualOpen ||
      fatSecretOpen ||
      aiOpen ||
      monthPickerOpen ||
      metricKeyOpen !== null,
  );

  useEffect(() => {
    if (!manualOpen) {
      setManualValues(INITIAL_MANUAL_VALUES);
    }
  }, [manualOpen]);

  const handleManualValueChange = (key, value) => {
    setManualValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSaveManual = () => {
    const nextFacts = MANUAL_FIELDS.reduce((accumulator, field) => {
      const rawValue = manualValues[field.key].trim();
      const parsedValue = rawValue === "" ? 0 : Number.parseFloat(rawValue);

      accumulator[field.key] = Number.isFinite(parsedValue) ? parsedValue : 0;
      return accumulator;
    }, {});

    setNutritionFactsByDate((previous) => ({
      ...previous,
      [selectedDateKey]: nextFacts,
    }));

    setManualOpen(false);
  };

  const metricValues = NUTRITION_METRICS.reduce((accumulator, metric) => {
    accumulator[metric.key] = selectedFacts?.[metric.key] ?? 0;
    return accumulator;
  }, {});

  const activeMetric = metricKeyOpen
    ? NUTRITION_METRICS.find((metric) => metric.key === metricKeyOpen)
    : null;

  return (
    <main className="nutrition-page">
      <header className="nutrition-topbar">
        <div className="nutrition-topbar__side">
          <button
            type="button"
            className="nutrition-topbar__icon"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <ChevronLeft size={20} strokeWidth={2.6} />
          </button>
        </div>

        <h1>Питание</h1>

        <div className="nutrition-topbar__side">
          <button
            type="button"
            className="nutrition-topbar__action"
            onClick={() => setGoalOpen(true)}
            aria-label="Редактировать цель периода"
          >
            <PencilLine size={18} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <section className="nutrition-content" aria-label="Питание">
        <div className="nutrition-content__inner">
          <article className="nutrition-calendar">
            <button
              type="button"
              className="nutrition-calendar__month"
              onClick={() => setMonthPickerOpen(true)}
            >
              {monthLabel}
              <ChevronDown size={14} strokeWidth={2.4} />
            </button>

            <div className="nutrition-calendar__weekdays" aria-hidden="true">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div
              className="nutrition-calendar__days"
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
                    className={`nutrition-calendar__day ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""}`}
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
            className="nutrition-goal"
            onClick={() => setGoalOpen(true)}
          >
            <span className="nutrition-section-label">Цель периода</span>
            <span className="nutrition-goal__value">
              {periodPlan?.title || "Не задана"}
            </span>
          </button>

          {selectedAssignment ? (
            <article className="nutrition-plan">
              <span className="nutrition-section-label">План на сегодня</span>
              <strong>{selectedAssignment.title}</strong>
              {selectedAssignment.comment ? (
                <p>{selectedAssignment.comment}</p>
              ) : null}
            </article>
          ) : null}

          <article
            className="nutrition-metrics"
            aria-label="Основные показатели"
          >
            <div className="nutrition-metrics__header">
              <div>
                <span className="nutrition-section-label">
                  КБЖУ + Вода + Соль
                </span>
                <strong>План ↔ факт</strong>
              </div>

              <button
                type="button"
                className="nutrition-metrics__header-action"
                onClick={() => setGoalOpen(true)}
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="nutrition-metrics__list">
              {NUTRITION_METRICS.map((metric) => (
                <button
                  key={metric.key}
                  type="button"
                  className="nutrition-metric"
                  onClick={() => setMetricKeyOpen(metric.key)}
                >
                  <span className="nutrition-metric__badge" aria-hidden="true">
                    {metric.badge}
                  </span>

                  <span className="nutrition-metric__content">
                    <span className="nutrition-metric__label">
                      {metric.label}
                    </span>
                    <span className="nutrition-metric__value">
                      {formatMetricValue(metricValues[metric.key], metric.unit)}
                    </span>
                    <span className="nutrition-metric__meta">
                      План не задан
                    </span>
                  </span>

                  <span className="nutrition-metric__arrow" aria-hidden="true">
                    <ChevronRight size={18} strokeWidth={2.3} />
                  </span>
                </button>
              ))}
            </div>
          </article>

          <article className="nutrition-add-data" aria-label="Добавить данные">
            <div className="nutrition-add-data__header">
              <span className="nutrition-section-label">Добавить данные</span>
            </div>

            <div className="nutrition-add-data__grid">
              <button type="button" onClick={() => setManualOpen(true)}>
                <span>Ввести вручную</span>
              </button>

              <button type="button" onClick={() => setFatSecretOpen(true)}>
                <span>Синхронизировать с FatSecret</span>
              </button>

              <button type="button" onClick={() => setAiOpen(true)}>
                <span>Импортировать скриншоты (AI)</span>
              </button>
            </div>
          </article>

          <FoodDetailsBlock
            isOpen={foodDetailsOpen}
            onToggle={() => setFoodDetailsOpen((previous) => !previous)}
            foodDetails={selectedFoodDetails}
          />
        </div>
      </section>

      {monthPickerOpen ? (
        <MonthPicker
          selectedDateKey={selectedDateKey}
          onPick={(dateKey) => {
            setSelectedDateKey(dateKey);
            setMonthPickerOpen(false);
          }}
          onClose={() => setMonthPickerOpen(false)}
        />
      ) : null}

      {goalOpen ? <GoalOverlay onClose={() => setGoalOpen(false)} /> : null}

      {metricKeyOpen && activeMetric ? (
        <MetricOverlay
          metric={activeMetric}
          factValue={metricValues[activeMetric.key]}
          planValue={null}
          onClose={() => setMetricKeyOpen(null)}
        />
      ) : null}

      {manualOpen ? (
        <ManualEntryOverlay
          selectedDate={selectedDate}
          values={manualValues}
          onChange={handleManualValueChange}
          onSubmit={handleSaveManual}
          onClose={() => setManualOpen(false)}
        />
      ) : null}

      {fatSecretOpen ? (
        <PlaceholderOverlay
          title="FatSecret"
          subtitle={formatFullDate(selectedDate)}
          message="Синхронизация с FatSecret пока не подключена."
          onClose={() => setFatSecretOpen(false)}
        />
      ) : null}

      {aiOpen ? (
        <PlaceholderOverlay
          title="Импорт скриншотов (AI)"
          subtitle={formatFullDate(selectedDate)}
          message="Импорт и распознавание скриншотов пока не подключены."
          onClose={() => setAiOpen(false)}
        />
      ) : null}

      {addChooserOpen ? (
        <Overlay
          title="Добавить данные"
          subtitle={formatFullDate(selectedDate)}
          onClose={() => setAddChooserOpen(false)}
        >
          <div className="nutrition-chooser">
            <button
              type="button"
              onClick={() => {
                setAddChooserOpen(false);
                setManualOpen(true);
              }}
            >
              Ввести вручную
            </button>
            <button
              type="button"
              onClick={() => {
                setAddChooserOpen(false);
                setFatSecretOpen(true);
              }}
            >
              Синхронизировать с FatSecret
            </button>
            <button
              type="button"
              onClick={() => {
                setAddChooserOpen(false);
                setAiOpen(true);
              }}
            >
              Импортировать скриншоты (AI)
            </button>
          </div>
        </Overlay>
      ) : null}
    </main>
  );
}
