import { Outlet } from "react-router-dom";

import BottomTabBar from "@/components/app/BottomTabBar";

import "./AppLayout.css";

export default function AppLayout() {
  return (
    <>
      <div className="app-layout">
        <Outlet />
      </div>

      <BottomTabBar />
    </>
  );
}
