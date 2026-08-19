import { Outlet } from "react-router-dom";
import BottomTabBar from "@/components/app/BottomTabBar";
import ScrollToTop from "@/components/common/ScrollToTop";

import "./AppLayout.css";

export default function AppLayout() {
  return (
    <>
      <ScrollToTop />

      <div className="app-layout">
        <div className="app-layout__content">
          <Outlet />
        </div>
      </div>

      <BottomTabBar />
    </>
  );
}
