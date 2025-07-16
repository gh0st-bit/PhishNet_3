import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { 
  SESSION_EVENTS, 
  SESSION_TIMEOUT,
  trackActivity, 
  forceLogout 
} from "@/lib/session-manager";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function SessionTimeoutWrapper({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const { logoutMutation } = useAuth();
  
  useEffect(() => {
    const handleWarning = () => {
      setShowWarning(true);
      
      // Start countdown timer
      const interval = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount <= 1) {
            clearInterval(interval);
            handleLogout();
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      setCountdownInterval(interval);
    };
    
    // Listen for timeout warning event
    document.addEventListener(SESSION_EVENTS.TIMEOUT_WARNING, handleWarning);
    
    return () => {
      document.removeEventListener(SESSION_EVENTS.TIMEOUT_WARNING, handleWarning);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, []);
  
  // Handle continue session
  const handleContinue = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setShowWarning(false);
    setCountdown(60);
    trackActivity();
  };
  
  // Handle logout
  const handleLogout = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setShowWarning(false);
    
    // Logout through auth system
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        forceLogout();
      }
    });
  };
  
  return (
    <>
      {children}
      
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span>Session Timeout Warning</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your session will expire in <span className="font-bold text-amber-500">{countdown}</span> seconds due to inactivity. 
              Would you like to continue your session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogout}>
              Logout
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue}>
              Continue Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}