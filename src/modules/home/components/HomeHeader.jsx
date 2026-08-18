import logo from "@/assets/obshee-logo.png";

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

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function HomeHeader({ userName, avatarUrl, email }) {
  const avatarInitials = userName
    ? getInitials(userName)
    : email?.charAt(0).toUpperCase() || "?";

  const now = new Date();

  const weekday = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
  }).format(now);

  const date = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <header className="home-header">
      <img className="home-header__logo" src={logo} alt="Stubborn Ram" />

      <div className="home-header__date">
        <span className="home-header__weekday">{capitalize(weekday)}</span>

        <span className="home-header__current-date">{date}</span>
      </div>

      <div
        className="home-header__avatar"
        aria-label={`Профиль: ${userName || email}`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" />
        ) : (
          <span>{avatarInitials}</span>
        )}
      </div>
    </header>
  );
}
