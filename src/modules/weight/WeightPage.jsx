import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Plus,
  Scale,
} from "lucide-react";

import "./WeightPage.css";

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

function formatShortDate(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatWeekday(date) {
  const weekday = new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
  }).format(date);

  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

function formatMonthYear(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatWeight(value, digits = 2) {
  return `${value.toFixed(digits)} кг`;
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getPrimaryMeasurement(measurements) {
  if (!measurements.length) {
    return null;
  }

  return [...measurements].sort((left, right) =>
    left.time.localeCompare(right.time),
  )[0];
}

function getWeekDays(date) {
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = addDays(date, -mondayOffset);

  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
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

function buildChartMetrics(points, width, height, padding = 8) {
  const values = points
    .filter((point) => point.value !== null)
    .map((point) => point.value);

  if (!values.length) {
    return { path: "", dots: [] };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 0.6);

  const dots = points.map((point, index) => {
    const x =
      padding +
      (index / Math.max(points.length - 1, 1)) * (width - padding * 2);

    if (point.value === null) {
      return { ...point, x, y: null };
    }

    const y =
      height -
      padding -
      ((point.value - min) / spread) * (height - padding * 2);

    return { ...point, x, y };
  });

  let path = "";
  let gap = true;

  dots.forEach((point) => {
    if (point.y === null) {
      gap = true;
      return;
    }

    path += `${path ? " " : ""}${gap ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    gap = false;
  });

  return { path, dots };
}

function Overlay({ title, subtitle, onClose, children, footer, wide = false }) {
  return (
    <div className="weight-overlay" role="presentation" onClick={onClose}>
      <div
        className={`weight-overlay__panel ${wide ? "weight-overlay__panel--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="weight-overlay__header">
          <div>
            <p className="weight-overlay__eyebrow">Вес</p>
            <h2>{title}</h2>
            {subtitle ? (
              <p className="weight-overlay__subtitle">{subtitle}</p>
            ) : null}
          </div>

          <button
            type="button"
            className="weight-icon-button"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <ChevronRight size={18} strokeWidth={2.25} />
          </button>
        </header>

        <div className="weight-overlay__body">{children}</div>

        {footer ? (
          <footer className="weight-overlay__footer">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}

function CompactGraph({ points }) {
  const metrics = buildChartMetrics(points, 100, 44, 4);

  if (!metrics.path) {
    return (
      <div className="weight-empty-mini">Нет данных для построения графика</div>
    );
  }

  return (
    <svg className="weight-chart" viewBox="0 0 100 44" aria-hidden="true">
      <path className="weight-chart__line" d={metrics.path} />
      {metrics.dots.map((point) =>
        point.y === null ? null : (
          <circle
            key={point.key}
            className="weight-chart__dot"
            cx={point.x}
            cy={point.y}
            r={2.3}
          />
        ),
      )}
    </svg>
  );
}

function buildGraphPoints(period, selectedDate, recordsByDay) {
  if (period === "year") {
    return Array.from({ length: 12 }, (_, index) => ({
      key: `${index}`,
      label: `${index + 1}`,
      value: null,
    }));
  }

  const count = period === "week" ? 7 : 30;
  const startDate = addDays(selectedDate, -(count - 1));

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(startDate, index);
    const dateKey = getLocalDateKey(date);
    const primary = getPrimaryMeasurement(recordsByDay[dateKey] || []);

    return {
      key: dateKey,
      label: `${date.getDate()}`,
      value: primary ? primary.value : null,
    };
  });
}

function DayOverlay({ date, measurements, onClose }) {
  return (
    <Overlay
      title={formatShortDate(date)}
      subtitle={
        measurements.length
          ? `${formatWeekday(date)} · ${measurements.length} измерений`
          : "Нет записей"
      }
      onClose={onClose}
    >
      {measurements.length ? (
        <div className="weight-detail__list">
          {measurements.map((measurement) => (
            <article key={measurement.id} className="weight-detail__item">
              <span className="weight-detail__time">{measurement.time}</span>
              <div className="weight-detail__main">
                <strong>{formatWeight(measurement.value)}</strong>
                {measurement.comment ? (
                  <small>{measurement.comment}</small>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="weight-empty-detail">Нет записей</div>
      )}
    </Overlay>
  );
}

function GraphOverlay({ recordsByDay, selectedDate, selectedKey, onClose }) {
  const [period, setPeriod] = useState("month");

  const points = useMemo(
    () => buildGraphPoints(period, selectedDate, recordsByDay),
    [period, recordsByDay, selectedDate],
  );
  const metrics = useMemo(
    () => buildChartMetrics(points, 320, 176, 10),
    [points],
  );
  const values = points
    .filter((point) => point.value !== null)
    .map((point) => point.value);

  const periodLabels = {
    week: "Неделя",
    month: "Месяц",
    year: "Год",
  };

  return (
    <Overlay
      title="Динамика веса"
      subtitle={periodLabels[period]}
      onClose={onClose}
      wide
    >
      <div className="weight-graph-detail">
        <div className="weight-segmented">
          {[
            ["week", "Неделя"],
            ["month", "Месяц"],
            ["year", "Год"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`weight-segmented__item ${period === value ? "is-active" : ""}`}
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {!values.length ? (
          <div className="weight-empty-detail">
            Нет данных для построения графика
          </div>
        ) : (
          <div className="weight-graph-detail__canvas">
            <svg
              viewBox="0 0 320 176"
              className="weight-graph-detail__svg"
              aria-hidden="true"
            >
              <path className="weight-graph-detail__line" d={metrics.path} />
              {metrics.dots.map((point) =>
                point.y === null ? null : (
                  <circle
                    key={point.key}
                    className={
                      point.key === selectedKey
                        ? "weight-graph-detail__dot is-selected"
                        : "weight-graph-detail__dot"
                    }
                    cx={point.x}
                    cy={point.y}
                    r={point.key === selectedKey ? 4.5 : 3.2}
                  />
                ),
              )}
            </svg>
          </div>
        )}

        <div className="weight-graph-detail__stats">
          <div>
            <span>Период</span>
            <strong>{periodLabels[period]}</strong>
          </div>
          <div>
            <span>Точек</span>
            <strong>{values.length}</strong>
          </div>
          <div>
            <span>Минимум</span>
            <strong>
              {values.length ? formatWeight(Math.min(...values)) : "—"}
            </strong>
          </div>
          <div>
            <span>Максимум</span>
            <strong>
              {values.length ? formatWeight(Math.max(...values)) : "—"}
            </strong>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

export default function WeightPage() {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getLocalDateKey(today), [today]);

  const [recordsByDay, setRecordsByDay] = useState({});
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [goalOpen, setGoalOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newComment, setNewComment] = useState("");

  useLockBodyScroll(
    goalOpen || planOpen || dayOpen || historyOpen || graphOpen || addOpen,
  );

  const selectedDate = useMemo(
    () => parseLocalDateKey(selectedDateKey),
    [selectedDateKey],
  );
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const selectedMeasurements = recordsByDay[selectedDateKey] || [];
  const selectedPrimary = getPrimaryMeasurement(selectedMeasurements);
  const monthGraphPoints = useMemo(
    () => buildGraphPoints("month", selectedDate, recordsByDay),
    [recordsByDay, selectedDate],
  );
  const monthGraphCount = monthGraphPoints.filter(
    (point) => point.value !== null,
  ).length;
  const historyItems = useMemo(() => {
    return Object.entries(recordsByDay)
      .map(([dateKey, measurements]) => ({
        dateKey,
        date: parseLocalDateKey(dateKey),
        measurements: [...measurements].sort((left, right) =>
          left.time.localeCompare(right.time),
        ),
        primary: getPrimaryMeasurement(measurements),
      }))
      .filter((entry) => entry.primary)
      .sort((left, right) => right.dateKey.localeCompare(left.dateKey));
  }, [recordsByDay]);

  const selectedDay = useMemo(() => {
    const measurements = recordsByDay[selectedDateKey] || [];

    return {
      date: selectedDate,
      measurements: [...measurements].sort((left, right) =>
        left.time.localeCompare(right.time),
      ),
    };
  }, [recordsByDay, selectedDate, selectedDateKey]);

  const selectedWeightValue = selectedPrimary?.value ?? null;
  const currentWeightLabel =
    selectedWeightValue !== null ? formatWeight(selectedWeightValue) : "— кг";
  const latestHistoryItem = historyItems[0] || null;

  useEffect(() => {
    if (!addOpen) {
      setNewWeight("");
      setNewComment("");
    }
  }, [addOpen]);

  const openDay = (dateKey = selectedDateKey) => {
    setSelectedDateKey(dateKey);
    setDayOpen(true);
  };

  const handleSaveMeasurement = (event) => {
    event.preventDefault();

    const numericWeight = Number.parseFloat(newWeight.replace(",", "."));

    if (Number.isNaN(numericWeight)) {
      return;
    }

    const measurement = {
      id: createId(),
      time: formatTime(new Date()),
      value: numericWeight,
      comment: newComment.trim(),
    };

    setRecordsByDay((previous) => {
      const nextMeasurements = previous[selectedDateKey]
        ? [...previous[selectedDateKey]]
        : [];

      return {
        ...previous,
        [selectedDateKey]: [...nextMeasurements, measurement].sort(
          (left, right) => left.time.localeCompare(right.time),
        ),
      };
    });

    setAddOpen(false);
  };

  return (
    <main className="weight-page">
      <div className="weight-page__content">
        <header className="weight-header">
          <div className="weight-header__title">
            <span className="weight-header__icon" aria-hidden="true">
              <Scale size={18} strokeWidth={2.2} />
            </span>
            <h1>Вес</h1>
          </div>

          <button
            type="button"
            className="weight-icon-button"
            onClick={() => setAddOpen(true)}
            aria-label="Добавить запись"
          >
            <Plus size={18} strokeWidth={2.3} />
          </button>
        </header>

        <div className="weight-scroll" aria-label="Содержимое Weight">
          <section className="weight-calendar" aria-label="Календарь веса">
            <div className="weight-calendar__weekdays" aria-hidden="true">
              {weekDays.map((date) => (
                <span key={getLocalDateKey(date)}>{formatWeekday(date)}</span>
              ))}
            </div>

            <div
              className="weight-calendar__days"
              role="tablist"
              aria-label="Выбор дня"
            >
              {weekDays.map((date) => {
                const dateKey = getLocalDateKey(date);
                const isSelected = dateKey === selectedDateKey;
                const isToday = dateKey === todayKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={`weight-calendar__day ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""}`}
                    onClick={() => setSelectedDateKey(dateKey)}
                    aria-pressed={isSelected}
                  >
                    <span className="weight-calendar__number">
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            className="weight-compact-row"
            onClick={() => setGoalOpen(true)}
          >
            <span className="weight-compact-row__left">
              <span className="weight-compact-row__label">Цель периода</span>
              <span className="weight-compact-row__value">Не задана</span>
            </span>
            <span className="weight-compact-row__right">
              <ChevronDown size={14} strokeWidth={2.3} />
            </span>
          </button>

          <button
            type="button"
            className="weight-compact-row"
            onClick={() => setPlanOpen(true)}
          >
            <span className="weight-compact-row__left">
              <span className="weight-compact-row__label">План на сегодня</span>
              <span className="weight-compact-row__value">—</span>
            </span>
            <span className="weight-compact-row__right">
              <ChevronDown size={14} strokeWidth={2.3} />
            </span>
          </button>

          <section className="weight-focus" aria-label="Текущий вес">
            <p className="weight-section-label">Текущий вес</p>
            <div className="weight-focus__value-row">
              <strong>{currentWeightLabel}</strong>
            </div>
            <div className="weight-focus__meta">
              <span>Нет измерений</span>
            </div>
          </section>

          <button
            type="button"
            className="weight-add-row"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={14} strokeWidth={2.35} />
            Добавить запись
          </button>

          <section className="weight-today-feed" aria-label="Записи сегодня">
            <div className="weight-today-feed__header">
              <span>Сегодняшние записи</span>
              <button
                type="button"
                className="weight-link"
                onClick={() => openDay(selectedDateKey)}
              >
                Все измерения дня <ChevronRight size={14} strokeWidth={2.3} />
              </button>
            </div>

            <div className="weight-measurements">
              {selectedMeasurements.length ? (
                selectedMeasurements.map((measurement) => (
                  <button
                    key={measurement.id}
                    type="button"
                    className="weight-measurement"
                    onClick={() => openDay(selectedDateKey)}
                  >
                    <span className="weight-measurement__time">
                      {measurement.time}
                    </span>
                    <span className="weight-measurement__value">
                      {formatWeight(measurement.value)}
                    </span>
                    <span className="weight-measurement__type">Измерение</span>
                    {measurement.comment ? (
                      <span className="weight-measurement__comment">
                        {measurement.comment}
                      </span>
                    ) : null}
                  </button>
                ))
              ) : (
                <div className="weight-empty-mini">Нет записей</div>
              )}
            </div>
          </section>

          <button
            type="button"
            className="weight-graph-card"
            onClick={() => setGraphOpen(true)}
          >
            <div className="weight-graph-card__header">
              <span>Динамика веса</span>
              <span className="weight-link">↗</span>
            </div>
            <CompactGraph points={monthGraphPoints} />
            <div className="weight-graph-card__footer">
              <span>
                {monthGraphCount
                  ? `${monthGraphCount} ${monthGraphCount === 1 ? "запись" : "записей"}`
                  : "Нет данных для построения графика"}
              </span>
              <span>{formatMonthYear(selectedDate)}</span>
            </div>
          </button>

          <button
            type="button"
            className="weight-history-row"
            onClick={() => {
              const latest = historyItems[0];

              if (latest) {
                setSelectedDateKey(latest.dateKey);
              }

              setHistoryOpen(true);
            }}
          >
            <span className="weight-history-row__label">История измерений</span>
            <span className="weight-history-row__value">
              {latestHistoryItem
                ? `${formatShortDate(latestHistoryItem.date)} — ${formatWeight(latestHistoryItem.primary.value)}`
                : "Нет записей"}
            </span>
            <ChevronRight size={16} strokeWidth={2.25} />
          </button>
        </div>
      </div>

      {goalOpen ? (
        <Overlay
          title="Цель периода"
          subtitle="Не задана"
          onClose={() => setGoalOpen(false)}
        >
          <div className="weight-empty-detail">Цель пока не задана.</div>
        </Overlay>
      ) : null}

      {planOpen ? (
        <Overlay
          title="План на сегодня"
          subtitle="Нет назначения"
          onClose={() => setPlanOpen(false)}
        >
          <div className="weight-empty-detail">План на сегодня не задан.</div>
        </Overlay>
      ) : null}

      {dayOpen ? (
        <DayOverlay
          date={selectedDay.date}
          measurements={selectedDay.measurements}
          onClose={() => setDayOpen(false)}
        />
      ) : null}

      {historyOpen ? (
        <Overlay
          title="История измерений"
          subtitle="Нет записей"
          onClose={() => setHistoryOpen(false)}
        >
          <div className="weight-empty-detail">Нет записей</div>
        </Overlay>
      ) : null}

      {graphOpen ? (
        <GraphOverlay
          recordsByDay={recordsByDay}
          selectedDate={selectedDate}
          selectedKey={selectedDateKey}
          onClose={() => setGraphOpen(false)}
        />
      ) : null}

      {addOpen ? (
        <Overlay
          title="Новая запись"
          subtitle={formatShortDate(selectedDate)}
          onClose={() => setAddOpen(false)}
          footer={
            <>
              <button
                type="button"
                className="weight-secondary-action"
                onClick={() => setAddOpen(false)}
              >
                Отмена
              </button>
              <button
                type="submit"
                form="weight-add-form"
                className="weight-primary-action"
              >
                Сохранить
              </button>
            </>
          }
        >
          <form
            id="weight-add-form"
            className="weight-form"
            onSubmit={handleSaveMeasurement}
          >
            <label className="weight-form__field">
              <span>Вес</span>
              <div className="weight-form__number-row">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={newWeight}
                  onChange={(event) => setNewWeight(event.target.value)}
                  placeholder=""
                />
                <strong>кг</strong>
              </div>
            </label>

            <label className="weight-form__field">
              <span>Комментарий</span>
              <textarea
                placeholder="Необязательно"
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
              />
            </label>
          </form>
        </Overlay>
      ) : null}
    </main>
  );
}
