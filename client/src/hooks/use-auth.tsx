import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { customToast } from "@/components/ui/custom-toast";

// Registration data with optional organization name
type RegistrationData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, RegistrationData>;
  forgotPasswordMutation: UseMutationResult<void, Error, { email: string }>;
  resetPasswordMutation: UseMutationResult<void, Error, { password: string, token: string }>;
};

type LoginData = Pick<InsertUser, "email" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Use our new toast system for success
      customToast.success({
        title: "Login successful",
        description: `Welcome back, ${user.firstName} ${user.lastName}!`,
      });
      
      // Force an immediate page navigation instead of relying on state changes
      window.location.href = "/";
    },
    onError: (error: Error) => {
      // Extract the remaining attempts from the error message if it exists
      let errorMessage = error.message;
      const attemptsMatch = error.message.match(/(\d+) attempts remaining/);
      const remainingAttempts = attemptsMatch ? attemptsMatch[1] : null;
      
      if (remainingAttempts) {
        errorMessage = `Invalid email or password. ${remainingAttempts} attempts remaining.`;
      }
      
      // Use our new toast system for errors
      customToast.error({
        title: "Login failed",
        description: errorMessage
      });
    },
  });

  // Using the RegistrationData type defined above
  
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegistrationData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: () => {
      // No longer setting user data since we're not auto-logging in
      // Instead we'll let the auth-page handle the success scenario
      // No automatic redirection, let form handle this
    },
    onError: (error: Error) => {
      customToast.error({
        title: "Registration failed",
        description: error.message
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      customToast.success({
        title: "Logged out successfully",
      });
      // Force an immediate page navigation to auth page
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      customToast.error({
        title: "Logout failed",
        description: error.message
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      await apiRequest("POST", "/api/forgot-password", { email });
    },
    onSuccess: () => {
      customToast.success({
        title: "Password reset email sent",
        description: "If an account exists with this email, you will receive instructions to reset your password.",
      });
    },
    onError: (error: Error) => {
      customToast.error({
        title: "Request failed",
        description: "If an account exists with this email, you will receive instructions to reset your password."
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password, token }: { password: string; token: string }) => {
      await apiRequest("POST", "/api/reset-password", { password, token });
    },
    onSuccess: () => {
      customToast.success({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      navigate("/auth");
    },
    onError: (error: Error) => {
      customToast.error({
        title: "Password reset failed",
        description: error.message
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        forgotPasswordMutation,
        resetPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
