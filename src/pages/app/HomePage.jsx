import HomeHeader from "@/components/home/HomeHeader";
import ModuleGrid from "@/components/home/ModuleGrid";
import NotificationSection from "@/components/home/NotificationSection";

import "./HomePage.css";

const mockUser = {
  userName: "Яна",
  avatarUrl: null,
  notificationsCount: 2,
};

export default function HomePage() {
  return (
    <main className="app-page home-page">
      <div className="home-page__content">
        <HomeHeader {...mockUser} />
        <NotificationSection />
        <ModuleGrid />
      </div>
    </main>
  );
}
