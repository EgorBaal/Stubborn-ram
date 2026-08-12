import { useLayoutEffect, useRef, useState } from "react";
import {
  House,
  BookOpen,
  ChartColumn,
  User,
  MessageCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import "./BottomTabBar.css";

let lastIndicatorState = {
  left: 0,
  width: 0,
  visible: false,
  ready: false,
};

const tabs = [
  {
    label: "Главная",
    path: "/app/home",
    icon: House,
  },
  {
    label: "Библиотека",
    path: "/app/library",
    icon: BookOpen,
  },
  {
    label: "Чат",
    path: "/app/chat",
    icon: MessageCircle,
  },
  {
    label: "Аналитика",
    path: "/app/analytics",
    icon: ChartColumn,
  },
  {
    label: "Профиль",
    path: "/app/profile",
    icon: User,
  },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navRef = useRef(null);
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: lastIndicatorState.left,
    width: lastIndicatorState.width,
    visible: lastIndicatorState.visible,
    ready: lastIndicatorState.ready,
  });

  const updateIndicatorPosition = () => {
    const activeTab = tabs.find((tab) => tab.path === location.pathname);

    if (!activeTab) {
      setIndicatorStyle((prev) => ({ ...prev, visible: false, ready: true }));
      return;
    }

    const navNode = navRef.current;
    const tabNode = tabRefs.current[activeTab.path];
    const contentNode =
      tabNode?.querySelector(".bottom-tab-bar__content") ||
      tabNode?.querySelector(".bottom-tab-bar__chat-button") ||
      tabNode;

    if (!navNode || !tabNode || !contentNode) {
      return;
    }

    const navRect = navNode.getBoundingClientRect();
    const tabRect = tabNode.getBoundingClientRect();
    const contentRect = contentNode.getBoundingClientRect();

    const horizontalPadding = 16;

    const desiredWidth = contentRect.width + horizontalPadding * 2;

    const maxWidth = tabRect.width - 8;

    const finalWidth = Math.min(desiredWidth, maxWidth);

    const left = tabRect.left - navRect.left + (tabRect.width - finalWidth) / 2;

    setIndicatorStyle({
      left,
      width: finalWidth,
      visible: true,
      ready: true,
    });
  };

  useLayoutEffect(() => {
    lastIndicatorState = indicatorStyle;
  }, [indicatorStyle]);

  useLayoutEffect(() => {
    updateIndicatorPosition();
  }, [location.pathname]);

  useLayoutEffect(() => {
    const handleResize = () => {
      updateIndicatorPosition();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className="bottom-tab-bar"
      aria-label="Основная навигация приложения"
    >
      <span
        className={`bottom-tab-bar__indicator ${indicatorStyle.visible ? "is-visible" : ""} ${indicatorStyle.ready ? "is-ready" : ""}`}
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.visible ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const isChat = tab.path === "/app/chat";
        const Icon = tab.icon;

        return (
          <Link
            key={tab.path}
            to={tab.path}
            ref={(node) => {
              if (node) {
                tabRefs.current[tab.path] = node;
              }
            }}
            className={`bottom-tab-bar__item ${isChat ? "is-chat" : ""} ${isActive ? "is-active" : ""}`}
            aria-label={tab.label}
          >
            {isChat ? (
              <span className="bottom-tab-bar__chat-button" aria-hidden="true">
                <MessageCircle size={20} strokeWidth={2} />
              </span>
            ) : (
              <div className="bottom-tab-bar__content">
                <Icon
                  size={20}
                  strokeWidth={2}
                  className="bottom-tab-bar__icon"
                />

                <span className="bottom-tab-bar__label">{tab.label}</span>
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
