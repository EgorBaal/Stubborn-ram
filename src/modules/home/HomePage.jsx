import { useAuth } from "@/contexts/AuthContext";

import HomeHeader from "@/modules/home/components/HomeHeader";
import ModuleGrid from "@/modules/home/components/ModuleGrid";
import NotificationSection from "@/modules/home/components/NotificationSection";

import "./HomePage.css";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="home-page">
      <HomeHeader
        avatarUrl={user?.user_metadata?.avatar_url}
        userName={user?.user_metadata?.full_name}
        email={user?.email}
      />

      <NotificationSection />
      <ModuleGrid />
    </main>
  );
}
