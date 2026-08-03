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
  { label: "Тренировка", path: "/app/training", icon: Dumbbell },
  { label: "Питание", path: "/app/nutrition", icon: Salad },
  { label: "Активность", path: "/app/activity-module", icon: Activity },
  { label: "Отчёт", path: "/app/report-module", icon: ClipboardList },
  { label: "Фото и замеры", path: "/app/photos", icon: Camera },
  { label: "Вес", path: "/app/weight", icon: Scale },
];

export default function ModuleGrid() {
  const navigate = useNavigate();

  return (
    <section className="module-grid" aria-label="Основные модули">
      {modules.map(({ label, path, icon: Icon }) => (
        <button
          key={label}
          type="button"
          className="module-grid__item"
          onClick={() => navigate(path)}
        >
          <span className="module-grid__icon" aria-hidden="true">
            <Icon size={34} strokeWidth={2} />
          </span>
          <span className="module-grid__label">{label}</span>
        </button>
      ))}
    </section>
  );
}
