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
          <div className="app-scroll">
            <Outlet />
          </div>
        </div>

        <div className="app-tabbar">
          <BottomTabBar />
        </div>
      </div>
    </>
  );
}
