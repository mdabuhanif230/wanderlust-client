import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wanderlust");

// Google sign-in stays disabled until both env vars are set (see .env.example).
const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    : undefined;

export const auth = betterAuth({
  // Pin OAuth callback generation to the configured canonical origin. This
  // avoids callbacks changing when the app is opened through a LAN IP.
  baseURL: process.env.BETTER_AUTH_URL,
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    // Password reset emails: no SMTP provider is configured for this project,
    // so the reset link is printed to the server console (visible in `npm run dev`).
    // In production, send `url` with a real email provider (Resend, SMTP, ...).
    sendResetPassword: async ({ user, url }) => {
      console.log(
        `\n[Password Reset] To: ${user.email}\nOpen this link to set a new password:\n${url}\n`,
      );
    },
  },
  socialProviders: google ? { google } : undefined,
  user: {
    // Extra profile fields shown on the /profile page. `input: true` lets the
    // client set them via authClient.updateUser; they're returned in the session.
    additionalFields: {
      location: { type: "string", required: false, defaultValue: "", input: true },
      nationality: { type: "string", required: false, defaultValue: "", input: true },
    },
  },
  plugins: [jwt()],
  session: {
    cookieCache: {
      enabled: true,
      strategy: 'jwt',
      maxAge: 7 * 24 * 60 * 60
    }
  }
});
