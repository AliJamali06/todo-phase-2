/**
 * Custom JWT token endpoint.
 *
 * Generates a JWT token from the current session for API authentication.
 * Uses HS256 algorithm with BETTER_AUTH_SECRET for signing.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import * as jose from "jose";

export async function GET(request: NextRequest) {
  try {
    // Debug: log environment (first 4 chars of secret only)
    const secretPreview = process.env.BETTER_AUTH_SECRET
      ? `${process.env.BETTER_AUTH_SECRET.slice(0, 4)}...`
      : "NOT SET";
    console.log("Token endpoint - BETTER_AUTH_SECRET:", secretPreview);

    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("Session check:", session?.user ? `User: ${session.user.email}` : "No session");

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get secret from environment
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      console.error("BETTER_AUTH_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error: BETTER_AUTH_SECRET missing" },
        { status: 500 }
      );
    }

    // Create a symmetric key from the secret for HS256
    const secretKey = new TextEncoder().encode(secret);

    // Generate JWT token
    const token = await new jose.SignJWT({
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    console.log("Token generated successfully, length:", token.length);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Also handle POST for compatibility
  return GET(request);
}
