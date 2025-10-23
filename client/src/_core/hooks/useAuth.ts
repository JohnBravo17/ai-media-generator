import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  // For testing: always return a dummy authenticated user
  const dummyUser = {
    id: "test-user-123",
    name: "Test User",
    email: "test@example.com",
    loginMethod: "test",
    role: "user" as const,
    createdAt: new Date(),
    lastSignedIn: new Date(),
  };

  const logout = useCallback(async () => {
    // Mock logout - just return success for testing
    console.log("Mock logout called");
  }, []);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(dummyUser)
    );

    return {
      user: dummyUser,
      isAuthenticated: true,
      loading: false,
      error: null,
      logout,
      refresh: () => Promise.resolve(),
    };
  }, [logout]);

  return state;
}
