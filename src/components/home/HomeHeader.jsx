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

export default function HomeHeader({
  userName,
  avatarUrl,
  notificationsCount,
}) {
  const avatarInitials = getInitials(userName);

  return (
    <header className="home-header">
      <img className="home-header__logo" src={logo} alt="Stubborn Ram" />

      <div className="home-header__avatar" aria-label={`Профиль: ${userName}`}>
        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{avatarInitials}</span>}
      </div>
    </header>
  );
}
