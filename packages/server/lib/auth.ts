import { betterAuth, env } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma.ts";
import { sendEmail } from "./email.ts";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    // ✅ sanity saver
    disableOriginCheck: env.NODE_ENV !== 'production',
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const feVerificationLink = `${env.BETTER_AUTH_URL}/verify-email?verify=true&token=${token}`
      void sendEmail({
          from: env.EMAIL_USER,
          to: user.email,
          subject: 'Verify your email address',
          text: `Click the link to verify your email: ${feVerificationLink}`
      })
    }
  }
})
