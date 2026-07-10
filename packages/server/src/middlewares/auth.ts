import "dotenv/config"
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.ts";

import type { Request } from "express";

export const authUser = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (session?.user == null) {
    console.warn("user not found")
    return "";
  } else return session.user.id;
}
