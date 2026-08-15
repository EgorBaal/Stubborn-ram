import { Outlet } from "react-router-dom";

import BottomTabBar from "@/components/app/BottomTabBar";

export default function AppLayout() {
  return (
    <>
      <div className="app">
        <div className="page">
          <Outlet />
        </div>
      </div>

      <BottomTabBar />
    </>
  );
}