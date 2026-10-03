import { useCallback, useEffect, useState } from 'react';

export const useCountdown = (initialSeconds = 0) => {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  const start = useCallback((seconds: number) => {
    const current = Date.now();
    setNow(current);
    setDeadline(seconds > 0 ? current + seconds * 1000 : null);
  }, []);

  const startUntil = useCallback(
    (isoDate: string) => start(Math.ceil((new Date(isoDate).getTime() - Date.now()) / 1000)),
    [start],
  );

  useEffect(() => {
    if (initialSeconds <= 0) return;
    const timer = setTimeout(() => start(initialSeconds), 0);
    return () => clearTimeout(timer);
  }, [initialSeconds, start]);

  useEffect(() => {
    if (deadline === null) return;
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) setDeadline(null);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const secondsLeft = deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
  return { secondsLeft, start, startUntil };
};

export const formatCountdown = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
