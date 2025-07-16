import { useState, useEffect, useCallback } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackActivity } from "@/lib/session-manager";

// Warning will show 1 minute before timeout
const WARNING_BEFORE_TIMEOUT = 60 * 1000; 

interface SessionTimeoutAlertProps {
  timeoutInMs: number;
  onContinue: () => void;
  onLogout: () => void;
}

export function SessionTimeoutAlert({ 
  timeoutInMs, 
  onContinue, 
  onLogout 
}: SessionTimeoutAlertProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_BEFORE_TIMEOUT / 1000);
  const { toast } = useToast();
  
  // Reset timer when user chooses to continue session
  const handleContinue = useCallback(() => {
    setShowWarning(false);
    trackActivity();
    onContinue();
    toast({
      title: "Session Extended",
      description: "Your session has been extended for 10 minutes.",
    });
  }, [onContinue, toast]);
  
  // Logout user when they click logout or time expires
  const handleLogout = useCallback(() => {
    setShowWarning(false);
    onLogout();
  }, [onLogout]);
  
  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    let countdownValue = WARNING_BEFORE_TIMEOUT / 1000;
    
    // Set timer to show warning before session expires
    warningTimer = setTimeout(() => {
      setShowWarning(true);
      
      // Start countdown timer
      countdownTimer = setInterval(() => {
        countdownValue -= 1;
        setCountdown(countdownValue);
        
        if (countdownValue <= 0) {
          clearInterval(countdownTimer);
          handleLogout();
        }
      }, 1000);
    }, timeoutInMs - WARNING_BEFORE_TIMEOUT);
    
    // Clean up timers
    return () => {
      clearTimeout(warningTimer);
      clearInterval(countdownTimer);
    };
  }, [timeoutInMs, handleLogout]);
  
  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-500">
            <Clock className="h-5 w-5" />
            Session Timeout Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in <span className="font-bold">{countdown}</span> seconds due to inactivity. Would you like to continue your session?
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
  );
}