export const TRACKED_PARAMETERS = [
  { id: "weight", label: "Вес", defaultSelected: true },
  { id: "repetitions", label: "Повторения", defaultSelected: true },
  { id: "difficulty", label: "Сложность", defaultSelected: true },
  { id: "distance", label: "Расстояние", defaultSelected: false },
  { id: "calories", label: "Калории", defaultSelected: false },
  { id: "speed", label: "Скорость", defaultSelected: false },
  { id: "power", label: "Мощность", defaultSelected: false },
  { id: "incline", label: "Наклон", defaultSelected: false },
  { id: "time", label: "Время", defaultSelected: false },
  { id: "rir", label: "RIR", defaultSelected: false },
  { id: "rpe", label: "RPE", defaultSelected: false },
];

export const DEFAULT_TRACKED_PARAMETER_IDS = TRACKED_PARAMETERS.filter(
  (parameter) => parameter.defaultSelected,
).map((parameter) => parameter.id);

const supportedParameterIds = new Set(
  TRACKED_PARAMETERS.map((parameter) => parameter.id),
);

export function normalizeTrackedParameters(value) {
  if (!Array.isArray(value)) {
    return [...DEFAULT_TRACKED_PARAMETER_IDS];
  }

  return [
    ...new Set(
      value.filter(
        (id) => typeof id === "string" && supportedParameterIds.has(id),
      ),
    ),
  ];
}
