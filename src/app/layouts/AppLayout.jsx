import { Outlet } from "react-router-dom";
import BottomTabBar from "@/components/app/BottomTabBar";
import ScrollToTop from "@/components/common/ScrollToTop";

import "./AppLayout.css";

export default function AppLayout() {
  return (
    <>
      <ScrollToTop />

      <div className="app-shell">
        <div className="app-page">
          <Outlet />
        </div>

        <div className="app-tabbar">
          <BottomTabBar />
        </div>
      </div>
    </>
  );
}
