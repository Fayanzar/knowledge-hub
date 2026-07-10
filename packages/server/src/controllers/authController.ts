import { prisma } from "../../lib/prisma.ts";
import type { User } from "../../generated/prisma/client.ts";
import type { Request, Response, NextFunction } from "express";
import { APIError } from "../middlewares/errorHandler.ts";
import { Buffer } from "node:buffer";
import { PrismaClientKnownRequestError } from "../../generated/prisma/internal/prismaNamespace.ts";
import { PrismaError } from "../middlewares/sqlErrorHandler.ts";

class UserToken {
  token: string
  id: number

  constructor(id: number, token: string) {
    this.token = token;
    this.id = id;
  }
}

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
  } catch (error) {
    next(error);
  }
}
