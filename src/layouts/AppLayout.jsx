import { Outlet, useLocation } from "react-router-dom";

import BottomTabBar from "@/components/app/BottomTabBar";

import "./AppLayout.css";

export default function AppLayout() {
  const location = useLocation();

  // Пока скрываем TabBar только в чате
  const hideTabBar = location.pathname === "/app/chat";

  return (
    <div className="app-layout">
      <div className="app-layout__content">
        <Outlet />
      </div>

      {!hideTabBar && <BottomTabBar />}
    </div>
  );
}
