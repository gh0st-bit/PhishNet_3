import { refreshSession } from "./queryClient";

// Session timeout in milliseconds (10 minutes)
export const SESSION_TIMEOUT = 10 * 60 * 1000;

// Event for communicating with components
export const SESSION_EVENTS = {
  TIMEOUT_WARNING: 'session-timeout-warning',
  SESSION_EXPIRED: 'session-expired'
};

let activityTimer: NodeJS.Timeout | null = null;
let lastActivityTime: number = Date.now();
let warningEmitted: boolean = false;

// Create custom events
const timeoutWarningEvent = new Event(SESSION_EVENTS.TIMEOUT_WARNING);
const sessionExpiredEvent = new Event(SESSION_EVENTS.SESSION_EXPIRED);

/**
 * Tracks user activity and refreshes the session
 */
export function trackActivity() {
  lastActivityTime = Date.now();
  warningEmitted = false;
  
  // Reset timer on activity
  if (activityTimer) {
    clearTimeout(activityTimer);
  }
  
  // Set new timer for session timeout
  activityTimer = setTimeout(() => {
    // Emit session expired event
    document.dispatchEvent(sessionExpiredEvent);
    // Force logout
    window.location.href = '/auth';
  }, SESSION_TIMEOUT);
  
  // Refresh session to keep it alive
  refreshSession(false);
}

/**
 * Function to manually logout user
 */
export function forceLogout() {
  window.location.href = '/auth';
}

/**
 * Initializes the session activity tracking
 */
export function initSessionManager() {
  // Set up event listeners to track user activity
  const activityEvents = [
    'mousedown', 'mousemove', 'keydown',
    'scroll', 'touchstart', 'click', 'keypress'
  ];
  
  activityEvents.forEach(event => {
    document.addEventListener(event, () => trackActivity(), false);
  });
  
  // Set a timer to check for inactivity and emit warning before timeout
  setInterval(() => {
    const currentTime = Date.now();
    const inactiveTime = currentTime - lastActivityTime;
    const timeUntilTimeout = SESSION_TIMEOUT - inactiveTime;
    
    // If we're within the warning period and haven't emitted a warning yet
    if (timeUntilTimeout <= 60000 && timeUntilTimeout > 0 && !warningEmitted) {
      warningEmitted = true;
      document.dispatchEvent(timeoutWarningEvent);
    }
  }, 10000); // Check every 10 seconds
  
  // Initial tracking
  trackActivity();
}

/**
 * Cleans up session manager when component unmounts
 */
export function cleanupSessionManager() {
  if (activityTimer) {
    clearTimeout(activityTimer);
    activityTimer = null;
  }
}