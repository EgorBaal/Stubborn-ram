import { Outlet, useLocation } from "react-router-dom";
import BottomTabBar from "@/components/app/BottomTabBar";
import ScrollToTop from "@/components/common/ScrollToTop";

import "./AppLayout.css";

// Модули, которые используют локальную прокрутку контейнеров.
// Все вложенные страницы автоматически наследуют это поведение.
const STATIC_PREFIXES = [
  "/app/home",
  "/app/training",
];

// Исключения: если когда-нибудь понадобится,
// сюда можно добавить страницу, которая должна
// использовать app-scroll.
const SCROLL_EXCEPTIONS = [
  // "/app/training/some-page",
];

export default function AppLayout() {
  const location = useLocation();

  const isStaticPage =
    STATIC_PREFIXES.some((prefix) =>
      location.pathname.startsWith(prefix)
    ) &&
    !SCROLL_EXCEPTIONS.includes(location.pathname);

  return (
    <>
      <ScrollToTop />

      <div className="app-shell">
        <div className="app-page">
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
