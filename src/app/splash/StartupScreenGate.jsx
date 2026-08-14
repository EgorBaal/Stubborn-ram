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
  const { loading: isAuthLoading } = useAuth();
  const [phase, setPhase] = useState(PHASE.VISIBLE);
  const [isMounted, setIsMounted] = useState(true);
  const shownAtRef = useRef(Date.now());

  useEffect(() => {
    if (!isMounted || isAuthLoading || phase === PHASE.LEAVING) {
      return;
    }

    const elapsed = Date.now() - shownAtRef.current;
    const delay = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    let unmountTimer = null;

    const leaveTimer = window.setTimeout(() => {
      setPhase(PHASE.LEAVING);

      unmountTimer = window.setTimeout(() => {
        setIsMounted(false);
      }, FADE_OUT_MS);
    }, delay);

    return () => {
      window.clearTimeout(leaveTimer);

      if (unmountTimer) {
        window.clearTimeout(unmountTimer);
      }
    };
  }, [isAuthLoading, isMounted, phase]);

  return (
    <>
      {children}
      {isMounted ? <StartupScreen isLeaving={phase === PHASE.LEAVING} /> : null}
    </>
  );
}
