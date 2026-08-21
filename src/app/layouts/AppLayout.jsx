import { Outlet, useLocation } from "react-router-dom";
import BottomTabBar from "@/components/app/BottomTabBar";
import ScrollToTop from "@/components/common/ScrollToTop";

import "./AppLayout.css";

// Страницы, которые всегда помещаются на один экран.
// Для них не используется app-scroll и резерв под TabBar.
const STATIC_PAGES = [
  "/app/home",

  "/app/training",
  "/app/training/templates",
  "/app/training/exercises",

  "/app/training/create",
  "/app/training/templates/create",
  "/app/training/exercises/create",
  "/app/training/programs",
];

export default function AppLayout() {
  const location = useLocation();

  const isStaticPage = STATIC_PAGES.includes(location.pathname);

  return (
    <>
      <ScrollToTop />

      <div className="app-shell">
        <div className="app-page">
          {/* 
            Статические страницы рендерятся напрямую внутри app-page.
            Все остальные страницы оборачиваются в app-scroll
            и получают стандартную систему прокрутки.
          */}
          {isStaticPage ? (
            <Outlet />
          ) : (
            <div className="app-scroll">
              <Outlet />
            </div>
          )}
        </div>

        <div className="app-tabbar">
          <BottomTabBar />
        </div>
      </div>
    </>
  );
}
