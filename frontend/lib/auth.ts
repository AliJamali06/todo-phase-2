import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Server-side Better Auth configuration.
 *
 * This configures authentication with:
 * - Email/password credentials
 * - PostgreSQL database for session storage
 * - JWT tokens for API authentication
 */
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (604800 seconds)
    updateAge: 60 * 60 * 24, // 1 day - session activity update
    cookie: {
      name: "better-auth.session",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days - cookie expiration
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
        definePayload: async ({ user }) => ({
          sub: user.id,
          email: user.email,
          name: user.name,
        }),
      },
    }),
  ],
});
