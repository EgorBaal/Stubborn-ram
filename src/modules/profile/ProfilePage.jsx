import { useNavigate } from "react-router-dom";
import {
  Bell,
  CircleHelp,
  FileText,
  MessageCircleMore,
  MonitorSmartphone,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/services/auth/authService";
import { useLoading } from "@/loading";

import "./ProfilePage.css";

const accountSections = [
  { label: "Личные данные", icon: UserRound },
  { label: "Настройки", icon: SlidersHorizontal },
  { label: "Уведомления", icon: Bell },
];

const supportSections = [
  { label: "FAQ", icon: CircleHelp },
  { label: "Связаться с нами", icon: MessageCircleMore },
  { label: "Политика конфиденциальности", icon: ShieldCheck },
];

const aboutSections = [
  { label: "Версия приложения", icon: MonitorSmartphone },
  { label: "Пользовательское соглашение", icon: FileText },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { show, hide } = useLoading();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Пользователь";

  const email = user?.email || "example@mail.com";

  const avatarUrl = user?.user_metadata?.avatar_url;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  async function handleSignOut() {
    const { error } = await signOut();

    if (!error) {
      navigate("/", { replace: true });
    }
  }

  function testLoadingOverlay() {
    show();

    setTimeout(() => {
      hide();
    }, 7500);
  }

  return (
    <main className="profile-page">
      <div className="profile-page__content">
        <section className="profile-card profile-card--hero">
          <div className="profile-card__avatar" aria-hidden="true">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <span>{avatarLetter}</span>
            )}
          </div>

          <div className="profile-card__info">
            <h1 className="profile-card__name">{displayName}</h1>
            <p className="profile-card__email">{email}</p>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section__title">Аккаунт</h2>
          <ul className="profile-list">
            {accountSections.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.label} className="profile-list__item">
                  <span className="profile-list__left">
                    <span className="profile-list__icon" aria-hidden="true">
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className="profile-list__label">{item.label}</span>
                  </span>
                  <span className="profile-list__arrow" aria-hidden="true">
                    ›
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="profile-section">
          <h2 className="profile-section__title">Поддержка</h2>
          <ul className="profile-list">
            {supportSections.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.label} className="profile-list__item">
                  <span className="profile-list__left">
                    <span className="profile-list__icon" aria-hidden="true">
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className="profile-list__label">{item.label}</span>
                  </span>
                  <span className="profile-list__arrow" aria-hidden="true">
                    ›
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="profile-section">
          <h2 className="profile-section__title">О приложении</h2>
          <ul className="profile-list">
            {aboutSections.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.label} className="profile-list__item">
                  <span className="profile-list__left">
                    <span className="profile-list__icon" aria-hidden="true">
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className="profile-list__label">{item.label}</span>
                  </span>
                  <span className="profile-list__arrow" aria-hidden="true">
                    ›
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <button
          type="button"
          className="profile-page__signout"
          onClick={handleSignOut}
        >
          Выйти из аккаунта
        </button>
        <button
          type="button"
          className="profile-page__signout"
          onClick={testLoadingOverlay}
        >
          Проверить Loading Overlay
        </button>
      </div>
    </main>
  );
}
