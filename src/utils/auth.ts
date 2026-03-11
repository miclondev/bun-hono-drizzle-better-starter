import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous } from "better-auth/plugins";
import { db } from "@/db/config";
import * as schema from "@/db/schema";
import { allowedOrigins } from "@/config/cors";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3005",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  plugins: [admin(), anonymous()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true when email service is configured
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement email sending when email service is configured
      // For now, log the reset URL (development only)
      console.log(`Password reset URL for ${user.email}: ${url}`);
      
      // In production, send email:
      // await sendEmail({
      //   to: user.email,
      //   subject: "Reset your password",
      //   html: `Click here to reset your password: ${url}`
      // });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Always enable route (will show error if credentials missing)
      // enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  trustedOrigins: allowedOrigins,
  rateLimit: {
    window: 10, // time in seconds
    max: 100,
  },
  advanced: {
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  },
});
