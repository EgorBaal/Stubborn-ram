import { Outlet } from "react-router-dom";

import BottomTabBar from "@/components/app/BottomTabBar";
import AuthGuard from "@/components/auth/AuthGuard";

import "./AppLayout.css";

export default function AppLayout() {
  return (
    <AuthGuard>
      <div className="app-layout">
        <div className="app-layout__content">
          <Outlet />
        </div>

        <BottomTabBar />
      </div>
    </AuthGuard>
  );
}
