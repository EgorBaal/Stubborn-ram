import { Link, useLocation } from "react-router-dom";

import "./BottomTabBar.css";

const tabs = [
  { label: "Главная", path: "/app/home" },
  { label: "Библиотека", path: "/app/library" },
  { label: "Чат", path: "/app/chat" },
  { label: "Аналитика", path: "/app/analytics" },
  { label: "Профиль", path: "/app/profile" },
];

export default function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="bottom-tab-bar" aria-label="Основная навигация приложения">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`bottom-tab-bar__item ${isActive ? "is-active" : ""}`}
          >
            <span className="bottom-tab-bar__label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
