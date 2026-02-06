"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

/**
 * Client-side Better Auth configuration.
 *
 * Provides React hooks and functions for authentication:
 * - useSession: Get current session state
 * - signIn: Sign in with credentials
 * - signUp: Create new account
 * - signOut: Sign out current user
 * - $fetch: Authenticated fetch with JWT
 */
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [jwtClient()],
  cookieName: "better-auth.session",
});

/**
 * Hook to get the current session.
 * Returns { data: session, isPending, error }
 */
export const useSession = authClient.useSession;

/**
 * Sign in with email and password.
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with session data or error
 */
export async function signInWithCredentials(email: string, password: string) {
  return authClient.signIn.email({
    email,
    password,
  });
}

/**
 * Sign up with email, password, and name.
 * @param email - User's email address
 * @param password - User's password
 * @param name - User's display name
 * @returns Promise with session data or error
 */
export async function signUpWithCredentials(
  email: string,
  password: string,
  name: string
) {
  return authClient.signUp.email({
    email,
    password,
    name,
  });
}

// Cache for the token to avoid repeated calls
let tokenCache: { token: string | null; expiresAt: number } | null = null;
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the token cache (useful after sign out)
 */
export function clearTokenCache() {
  tokenCache = null;
}

/**
 * Sign out the current user.
 * @returns Promise that resolves when sign out is complete
 */
export async function signOutUser() {
  clearTokenCache();
  return authClient.signOut();
}

/**
 * Get JWT token for API requests.
 * Includes caching and retry logic for better reliability.
 * @returns Promise with the JWT string or null if not authenticated
 */
export async function getToken(): Promise<string | null> {
  // Check cache first
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  try {
    // Get session first to check if user is authenticated
    const session = await authClient.getSession();
    if (!session?.data?.user) {
      tokenCache = null;
      return null;
    }

    // Get the JWT token from our custom endpoint
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseURL}/api/auth/token`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Token endpoint error:", response.status);
      tokenCache = null;
      return null;
    }

    const data = await response.json();
    const token = data?.token ?? null;

    // Cache the token
    if (token) {
      tokenCache = {
        token,
        expiresAt: Date.now() + TOKEN_CACHE_TTL,
      };
    }

    return token;
  } catch (error) {
    console.error("Failed to get token:", error);
    tokenCache = null;
    return null;
  }
}

// Export the auth client for advanced usage
export { authClient };
