/**
 * TimerContext – global rest timer state shared across all screens.
 *
 * When the user logs a set in WorkoutSessionScreen the timer starts.
 * The RestTimerBanner displayed in the navigator header reads this context.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {notificationService} from '../services/notificationService';

const DEFAULT_REST_KEY = 'gt_default_rest_seconds';
const DEFAULT_REST = 150; // 2.5 minutes

interface TimerState {
  isRunning: boolean;
  secondsRemaining: number;
  totalSeconds: number;
  /** Formatted "M:SS" */
  formattedTime: string;
  /** 0→1 elapsed fraction (for progress ring) */
  progress: number;
  /** User-configurable default in seconds */
  defaultRestSeconds: number;
  /** Start (or restart) the timer */
  start: (durationSeconds?: number) => void;
  /** Stop and reset */
  cancel: () => void;
  /** Persist a new default duration */
  setDefaultRestSeconds: (seconds: number) => void;
}

const TimerContext = createContext<TimerState | null>(null);

export function TimerProvider({children}: {children: React.ReactNode}): React.JSX.Element {
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_REST);
  const [defaultRestSeconds, setDefaultRestSecondsState] = useState(DEFAULT_REST);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load persisted default on mount
  useEffect(() => {
    AsyncStorage.getItem(DEFAULT_REST_KEY).then(val => {
      if (val) {
        setDefaultRestSecondsState(Number(val));
      }
    });
  }, []);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    clearInterval_();
    setIsRunning(false);
    setSecondsRemaining(0);
    notificationService.cancelRestNotification();
  }, [clearInterval_]);

  const start = useCallback(
    (durationSeconds?: number) => {
      const secs = durationSeconds ?? defaultRestSeconds;
      cancel();
      setTotalSeconds(secs);
      setSecondsRemaining(secs);
      setIsRunning(true);
      notificationService.scheduleRestNotification(secs);

      intervalRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval_();
            setIsRunning(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    },
    [cancel, clearInterval_, defaultRestSeconds],
  );

  // Clean up on unmount
  useEffect(() => () => clearInterval_(), [clearInterval_]);

  const setDefaultRestSeconds = useCallback(async (seconds: number) => {
    setDefaultRestSecondsState(seconds);
    await AsyncStorage.setItem(DEFAULT_REST_KEY, String(seconds));
  }, []);

  const formattedTime = `${Math.floor(secondsRemaining / 60)}:${String(secondsRemaining % 60).padStart(2, '0')}`;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        secondsRemaining,
        totalSeconds,
        formattedTime,
        progress,
        defaultRestSeconds,
        start,
        cancel,
        setDefaultRestSeconds,
      }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer(): TimerState {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return ctx;
}
