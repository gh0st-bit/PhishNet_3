import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';

export function useIdleTimeout(timeout = 10 * 60 * 1000) { // 10 minutes in milliseconds
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const { logoutMutation } = useAuth();

  useEffect(() => {
    const updateLastActivity = () => {
      setLastActivity(Date.now());
      setIsIdle(false);
    };

    // Events to track user activity
    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click', 'keydown'
    ];

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    // Check idle status periodically
    const idleInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > timeout) {
        setIsIdle(true);
        // Auto logout when idle
        if (!isIdle) {
          logoutMutation.mutate();
        }
      }
    }, 60000); // Check every minute

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(idleInterval);
    };
  }, [lastActivity, timeout, isIdle, logoutMutation]);

  return { isIdle };
}