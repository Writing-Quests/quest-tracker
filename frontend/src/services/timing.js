import { useEffect, useRef, useState } from 'react';

// working from this guide
// https://medium.com/@sfcofc/implementing-polling-in-react-a-guide-for-efficient-real-time-data-fetching-47f0887c54a7


export const useVisibilityChange = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  return isVisible;
};

export function usePolling(callback, delay) {
  const pollingRef = useRef(null);
  useEffect(() => {
    if (delay !== null) {
      pollingRef.current = setInterval(() => {
        callback()
      }, delay)
      return () => clearInterval(pollingRef.current);
    }
  }, [delay]);
};

// jacked from https://www.joshwcomeau.com/snippets/react-hooks/use-timeout/

export function useTimeout(callback, delay) {
  const timeoutRef = useRef(null);
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    const tick = () => savedCallback.current();

    if (typeof delay === 'number') {
      timeoutRef.current = window.setTimeout(tick, delay);

      return () => window.clearTimeout(timeoutRef.current);
    }
  }, [delay]);
  return timeoutRef;
};