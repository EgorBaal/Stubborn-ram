import HomeHeader from "@/modules/home/components/HomeHeader";
import ModuleGrid from "@/modules/home/components/ModuleGrid";
import NotificationSection from "@/modules/home/components/NotificationSection";
import PageScroll from "@/components/app/PageScroll";

import "./HomePage.css";

const mockUser = {
  userName: "Александр",
  avatarUrl: null,
  notificationsCount: 2,
};

export default function HomePage() {
  return (
    <PageScroll>
      <main className="home-page">
        <HomeHeader {...mockUser} />
        <NotificationSection />
        <ModuleGrid />
      </main>
    </PageScroll>
  );
}
