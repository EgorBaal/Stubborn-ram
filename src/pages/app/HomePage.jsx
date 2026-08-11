import BottomTabBar from "@/components/app/BottomTabBar";
import HomeHeader from "@/components/home/HomeHeader";
import ModuleGrid from "@/components/home/ModuleGrid";
import NotificationSection from "@/components/home/NotificationSection";

import "./HomePage.css";

const mockUser = {
  userName: "Александр",
  avatarUrl: null,
  notificationsCount: 2,
};

export default function HomePage() {
  return (
    <main className="home-page">
      <HomeHeader {...mockUser} />
      <NotificationSection />
      <ModuleGrid />
      <BottomTabBar />
    </main>
  );
}
