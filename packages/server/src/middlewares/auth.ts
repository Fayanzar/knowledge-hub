import { prisma } from "../../lib/prisma.ts";
import type { Request } from "express";

export const authUser = async (req: Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader == null) return 0;

  const authPattern: RegExp = /Basic\s(.*)/
  const authMatch = authHeader.match(authPattern);
  if (authMatch == null || authMatch[1] == null) {
    console.warn("authorization header not recognized");
    return 0;
  }

  const [login, password] = Buffer.from(authMatch[1], 'base64').toString('utf8').split(':');
  if (login == null || password == null) {
    console.warn("badly formatted Basic authorization header")
    return 0;
  }

  const user = await prisma.user.findFirst({
    where: {
      email: login,
      password: password
    }
  })

  if (user == null) {
    console.warn("user not found")
    return 0;
  } else return user.id;
}
