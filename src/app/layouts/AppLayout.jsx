import { Outlet, useLocation } from "react-router-dom";

import BottomTabBar from "@/components/app/BottomTabBar";
import AuthGuard from "@/components/auth/AuthGuard";

import "./AppLayout.css";

export default function AppLayout() {
  const location = useLocation();

  // Пока скрываем TabBar только в чате
  const hideTabBar = location.pathname === "/app/chat";

  return (
    <AuthGuard>
      <div className="app-layout">
        <div className="app-layout__content">
          <Outlet />
        </div>

        {!hideTabBar && <BottomTabBar />}
      </div>
    </AuthGuard>
  );
}
