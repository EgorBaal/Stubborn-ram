import { useRef } from "react";
import {
  ChevronRight,
  ClipboardList,
  MessageCircle,
  Scale,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./NotificationSection.css";

const notifications = [
  {
    title: "Комментарий тренера",
    subtitle: "2 часа назад",
    path: "/app/comments",
    Icon: MessageCircle,
  },
  {
    title: "Напоминание по отчёту",
    subtitle: "Добавьте текущий вес",
    path: "/app/report",
    Icon: ClipboardList,
  },
  {
    title: "Напоминание по активности",
    subtitle: "Не забудьте отметить активность",
    path: "/app/activity",
    Icon: Scale,
  },
];

export default function NotificationSection() {
  const navigate = useNavigate();
  const swipeStartX = useRef(null);

  const handleTouchStart = (event) => {
    swipeStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    swipeStartX.current = null;
  };

  return (
    <section className="notification-section" aria-label="Уведомления">
      {notifications.map(({ title, subtitle, path, Icon }) => (
        <button
          key={title}
          type="button"
          className="notification-card"
          onClick={() => navigate(path)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <span className="notification-card__icon" aria-hidden="true">
            <Icon size={18} strokeWidth={2} />
          </span>

          <span className="notification-card__content">
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </span>

          <span className="notification-card__arrow" aria-hidden="true">
            <ChevronRight size={18} strokeWidth={2} />
          </span>
        </button>
      ))}
    </section>
  );
}
