import {
  Activity,
  Camera,
  ClipboardList,
  Dumbbell,
  Scale,
  Salad,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./ModuleGrid.css";

const modules = [
  {
    label: (
      <span className="module-grid__label-stack">
        <span>Фото</span>
        <span>Замеры</span>
      </span>
    ),
    path: "/app/photos",
    icon: Camera,
    accentClass: "module-grid__item--photo",
  },

  {
    label: "Питание",
    path: "/app/nutrition",
    icon: Salad,
    accentClass: "module-grid__item--nutrition",
  },

  {
    label: "Тренировка",
    path: "/app/training",
    icon: Dumbbell,
    accentClass: "module-grid__item--training",
  },

  {
    label: "Отчёт",
    path: "/app/report-module",
    icon: ClipboardList,
    accentClass: "module-grid__item--report",
  },

  {
    label: "Активность",
    path: "/app/activity-module",
    icon: Activity,
    accentClass: "module-grid__item--activity",
  },

  {
    label: "Вес",
    path: "/app/weight",
    icon: Scale,
    accentClass: "module-grid__item--weight",
  },
];

export default function ModuleGrid() {
  const navigate = useNavigate();

  return (
    <section className="module-grid" aria-label="Основные модули">
      {modules.map(({ label, path, icon: Icon, accentClass }) => (
        <button
          key={path}
          type="button"
          className={`module-grid__item ${accentClass}`}
          onClick={() => navigate(path)}
        >
          <span className="module-grid__surface" aria-hidden="true">
            <span className="module-grid__surface-texture" />
            <span className="module-grid__surface-beam module-grid__surface-beam--a" />
            <span className="module-grid__surface-beam module-grid__surface-beam--b" />
            <span className="module-grid__surface-beam module-grid__surface-beam--c" />
          </span>

          <span className="module-grid__icon" aria-hidden="true">
            <Icon size={34} strokeWidth={2} />
          </span>

          <span className="module-grid__label">{label}</span>
        </button>
      ))}
    </section>
  );
}
