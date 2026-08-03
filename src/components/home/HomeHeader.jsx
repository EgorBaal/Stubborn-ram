import { Bell } from "lucide-react";

import "./HomeHeader.css";

function getInitials(userName) {
  return userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();
}

export default function HomeHeader({
  userName,
  avatarUrl,
  notificationsCount,
}) {
  const hasNotifications = notificationsCount > 0;
  const avatarInitials = getInitials(userName);

  return (
    <header className="home-header">
      <p className="home-header__greeting">
        <span>Добрый вечер,</span>
        <strong>{userName}</strong>
      </p>

      <div className="home-header__actions">
        <button
          className="home-header__notification-button"
          type="button"
          aria-label={
            hasNotifications
              ? `Уведомления: ${notificationsCount}`
              : "Уведомления"
          }
        >
          <Bell aria-hidden="true" size={20} strokeWidth={1.8} />
          {hasNotifications && (
            <span className="home-header__notification-badge" aria-hidden="true">
              {notificationsCount}
            </span>
          )}
        </button>

        <div className="home-header__avatar" aria-label={`Профиль: ${userName}`}>
          {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{avatarInitials}</span>}
        </div>
      </div>
    </header>
  );
}
