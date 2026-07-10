import { betterAuth, env } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma.ts";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
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
})
