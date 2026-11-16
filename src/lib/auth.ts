import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";

const baseURL = (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [baseURL],

  // Same PostgreSQL database as the Express backend.
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      jwks: schema.jwks,
    },
  }),

  emailAndPassword: { enabled: true, minPasswordLength: 8 },

  user: {
    additionalFields: {
      // input:false = a visitor can NOT choose their role while registering.
      role: { type: "string", defaultValue: "viewer", input: false },
      isActive: { type: "boolean", defaultValue: true, input: false },
    },
  },

  advanced: {
    cookiePrefix: "datascope",
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  databaseHooks: {
    session: {
      create: {
        // A deactivated user can not sign in at all.
        before: async (session) => {
          const [u] = await db
            .select({ isActive: schema.users.isActive })
            .from(schema.users)
            .where(eq(schema.users.id, session.userId))
            .limit(1);
          if (u && !u.isActive) {
            throw new APIError("FORBIDDEN", { message: "This account has been deactivated" });
          }
        },
      },
    },
  },

  plugins: [
    // Issues short-lived JWTs that the Express API verifies with our public keys.
    jwt({
      jwt: {
        issuer: baseURL,
        audience: baseURL,
        expirationTime: "15m",
        // Keep the token small. Express re-reads the role from the database anyway.
        definePayload: ({ user }) => ({ email: user.email, name: user.name }),
      },
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
