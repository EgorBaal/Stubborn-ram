import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

import StartupScreen from "./StartupScreen";
import "./startupScreen.css";

const PHASE = {
  VISIBLE: "visible",
  LEAVING: "leaving",
};

const MIN_VISIBLE_MS = 3500;
const FADE_OUT_MS = 650;

export default function StartupScreenGate({ children }) {
  const { session, loading: isAuthLoading } = useAuth();

  const [phase, setPhase] = useState(PHASE.VISIBLE);
  const [isMounted, setIsMounted] = useState(true);

  // Таймер начинается сразу при открытии приложения
  const appStartedAtRef = useRef(Date.now());

  // Не показываем Startup Screen неавторизованным пользователям
  if (!isAuthLoading && !session) {
    return children;
  }

  useEffect(() => {
    if (!isMounted || phase === PHASE.LEAVING) {
      return;
    }

    // Пока авторизация не закончилась — просто ждем.
    if (isAuthLoading) {
      return;
    }

    const elapsed = Date.now() - appStartedAtRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    let fadeTimer;
    let unmountTimer;

    fadeTimer = window.setTimeout(() => {
      setPhase(PHASE.LEAVING);

      unmountTimer = window.setTimeout(() => {
        setIsMounted(false);
      }, FADE_OUT_MS);
    }, remaining);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [isAuthLoading, isMounted, phase]);

  return (
    <>
      {children}
      {isMounted && <StartupScreen isLeaving={phase === PHASE.LEAVING} />}
    </>
  );
}
