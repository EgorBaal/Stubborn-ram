import { useContext, useEffect, useRef, useState } from "react";

import { LoadingContext } from "./LoadingContext";
import LoadingScreen from "./LoadingScreen";
import "./loading.css";

const PHASE = {
  HIDDEN: "hidden",
  ENTERING: "entering",
  VISIBLE: "visible",
  LEAVING: "leaving",
};

const SHOW_DELAY_MS = 350;
const MIN_VISIBLE_MS = 600;
const ENTER_STEP_MS = 16;
const LEAVE_MS = 280;

export default function LoadingOverlay() {
  const context = useContext(LoadingContext);
  const isLoading = context?.isLoading ?? false;
  const [phase, setPhase] = useState(PHASE.HIDDEN);

  const loadingRequestedRef = useRef(isLoading);
  const shownAtRef = useRef(0);
  const showDelayTimerRef = useRef(null);
  const enterTimerRef = useRef(null);
  const leaveDelayTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const clearTimer = (timerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearAllTimers = () => {
    clearTimer(showDelayTimerRef);
    clearTimer(enterTimerRef);
    clearTimer(leaveDelayTimerRef);
    clearTimer(hideTimerRef);
  };

  const scheduleShow = () => {
    if (showDelayTimerRef.current) {
      return;
    }

    clearTimer(leaveDelayTimerRef);
    clearTimer(hideTimerRef);

    showDelayTimerRef.current = setTimeout(() => {
      showDelayTimerRef.current = null;

      if (!loadingRequestedRef.current || phase !== PHASE.HIDDEN) {
        return;
      }

      startEntering();
    }, SHOW_DELAY_MS);
  };

  const startEntering = () => {
    clearAllTimers();
    shownAtRef.current = Date.now();
    setPhase(PHASE.ENTERING);

    enterTimerRef.current = setTimeout(() => {
      setPhase(PHASE.VISIBLE);
      enterTimerRef.current = null;
    }, ENTER_STEP_MS);
  };

  const startLeaving = () => {
    clearTimer(showDelayTimerRef);
    clearTimer(enterTimerRef);
    clearTimer(leaveDelayTimerRef);
    clearTimer(hideTimerRef);

    const elapsed = Date.now() - shownAtRef.current;
    const delay = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    leaveDelayTimerRef.current = setTimeout(() => {
      setPhase(PHASE.LEAVING);
      leaveDelayTimerRef.current = null;

      hideTimerRef.current = setTimeout(() => {
        setPhase(PHASE.HIDDEN);
        hideTimerRef.current = null;
      }, LEAVE_MS);
    }, delay);
  };

  const resumeFromLeaving = () => {
    clearTimer(showDelayTimerRef);
    clearTimer(leaveDelayTimerRef);
    clearTimer(hideTimerRef);

    shownAtRef.current = Date.now();
    setPhase(PHASE.VISIBLE);
  };

  useEffect(() => {
    loadingRequestedRef.current = isLoading;

    if (isLoading) {
      if (phase === PHASE.HIDDEN) {
        scheduleShow();
      }

      if (phase === PHASE.LEAVING) {
        resumeFromLeaving();
      }

      return;
    }

    if (phase === PHASE.HIDDEN) {
      clearTimer(showDelayTimerRef);
      return;
    }

    if (phase === PHASE.ENTERING || phase === PHASE.VISIBLE) {
      startLeaving();
    }
  }, [isLoading, phase]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  if (phase === PHASE.HIDDEN) {
    return null;
  }

  return (
    <div
      className={`loading-overlay loading-overlay--${phase}`}
      role="presentation"
    >
      <LoadingScreen />
    </div>
  );
}
