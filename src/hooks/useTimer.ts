import { useState, useEffect, useCallback } from 'react';
import { getElapsedSeconds } from '../stores/timerStore';

export function useElapsedTime(startTime: string | null, isRunning: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning || !startTime) {
      setElapsed(0);
      return;
    }

    // Initial calculation
    setElapsed(getElapsedSeconds(startTime));

    // Update every second
    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  return elapsed;
}

export function useStopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && startTime) {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));

      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const start = useCallback(() => {
    setStartTime(new Date());
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    const finalElapsed = startTime
      ? Math.floor((Date.now() - startTime.getTime()) / 1000)
      : 0;
    return { startTime, elapsed: finalElapsed };
  }, [startTime]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setElapsed(0);
  }, []);

  return {
    isRunning,
    startTime,
    elapsed,
    start,
    stop,
    reset,
  };
}
