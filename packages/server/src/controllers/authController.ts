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

export const postLoginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.body as User;
    const loggedInUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: user.email
        },
        password: {
          equals: user.password
        }
      }
    })
  if (loggedInUser == null)
    throw new APIError("wrong credentials", 401);
  else {
    const userString = loggedInUser.email + ':' + loggedInUser.password;
    const token = Buffer.from(userString, 'utf8').toString('base64');
    res.json(new UserToken(loggedInUser.id, token));
  }
  } catch (error) {
    next(error);
  }
}

export const postUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = req.body as User;
    const user = await prisma.user.create({
      data: {
        email: newUser.email,
        password: newUser.password
      }
    })
    res.json(user);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code == PrismaError.UniqueConstraintFailed)
      res.status(409).json({
        message: "user with such email already exists"
      });
    next(error);
  }
}
