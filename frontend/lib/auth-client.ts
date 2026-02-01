"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Client-side Better Auth configuration.
 * 
 * Provides React hooks and functions for authentication:
 * - useSession: Get current session state
 * - signIn: Sign in with credentials
 * - signUp: Create new account
 * - signOut: Sign out current user
 */
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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

/**
 * Sign out the current user.
 * @returns Promise that resolves when sign out is complete
 */
export async function signOutUser() {
  return authClient.signOut();
}

/**
 * Get the current session token for API requests.
 * @returns Promise with the token string or null if not authenticated
 */
export async function getToken(): Promise<string | null> {
  const session = await authClient.getSession();
  return session?.data?.session?.token ?? null;
}

// Export the auth client for advanced usage
export { authClient };
