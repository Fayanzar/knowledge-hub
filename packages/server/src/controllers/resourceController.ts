import { prisma } from "../../lib/prisma.ts";
import type { Request, Response, NextFunction } from "express";
import { APIError } from "../middlewares/errorHandler.ts";
import { PrismaClientKnownRequestError } from "../../generated/prisma/internal/prismaNamespace.ts";
import { PrismaError } from "../middlewares/sqlErrorHandler.ts";
import { authUser } from "../middlewares/auth.ts";

interface PostResourceRequest {
  url: string
}

export const getAllResources =
async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allResources = await prisma.resource.findMany();
    res.json(allResources);
  } catch (error) {
    next(error);
  }
}

export const getUserResources =
async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.uid as string);
    if (Number.isNaN(userId))
      throw new APIError("bad user id", 400);

    const resources = await prisma.resource.findMany({
      relationLoadStrategy: 'join',
      include: {
        tags: {
          include: {
            tag: {
              omit: {
                userId: true
              }
            }
          },
          omit: {
            tagId: true,
            resourceId: true
          }
        }
      },
      where: {
        userId: userId
      }
    })
    res.json(resources.map(v => {
        const newV = {
          id: v.id,
          url: v.url,
          userId: v.userId,
          tags: v.tags.map(t => t.tag)
        };
        return newV;
      }
    ));
  } catch (error) {
    next(error);
  }
}

const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

export const postUserResource =
async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loggedUid = await authUser(req);
    const userId = Number(req.params.uid as string);
    if (loggedUid != userId) throw new APIError('not authorized', 401);
    if (Number.isNaN(userId))
      throw new APIError("bad user id", 400);

    const url = (req.body as PostResourceRequest).url;
    if (!validateUrl(url))
      throw new APIError("invalid url", 400);
    const resource = await prisma.resource.create({
      data: {
        userId: userId,
        url: url
      }
    });
  res.json({id: resource.id});
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code == PrismaError.UniqueConstraintFailed)
        res.status(409).json({
          message: "such resource for the given user already exists"
        });
      if (error.code == PrismaError.ForeignKeyConstraintFailed)
        res.status(409).json({
          message: "such user does not exist"
        })
    }
    next(error);
  }
}

export const deleteResource =
async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loggedUid = await authUser(req);
    const resourceId = parseInt(req.params.resid as string);
    if (Number.isNaN(resourceId))
      throw new APIError("bad resource id", 400);

    const resource = await prisma.resource.findFirst({
      where: {
        id: resourceId
      }
    });
    if (resource == null)
      res.status(404).json({
        message: "such resource does not exist"
      });

    const userId = resource?.userId;
    if (loggedUid != userId) throw new APIError('not authorized', 401);

    const resourceTags = await prisma.tagsOnResources.findMany({
      where: {
        resourceId: resourceId
      },
      omit: {
        resourceId: true
      }
    });
    const groupedTags = await prisma.tagsOnResources.groupBy({
      by: ['tagId'],
      _count: {_all: true},
      where: {
        tagId: {
          in: resourceTags.map(v => v.tagId)
        }
      }
    });
    const tagsToDelete = groupedTags.filter(v => v._count._all <= 1).map(v => v.tagId);
    await prisma.tag.deleteMany({
      where: {
        id: {
          in: tagsToDelete
        }
      }
    });
    await prisma.resource.delete({
      where: {
        userId: userId,
        id: resourceId
      }
    });
    res.status(200).json({});
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code == PrismaError.OpFailedBecauserRecordsNotFound)
        res.status(404).json({
          message: "such resource does not exist"
        });
    }
    next(error);
  }
}

export const deleteAllUserResources =
async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loggedUid = await authUser(req);
    const userId = parseInt(req.params.uid as string);
    if (loggedUid != userId) throw new APIError('not authorized', 401);
    if (Number.isNaN(userId))
      throw new APIError("bad user id", 400);

    await prisma.tag.deleteMany({
      where: {
        userId: userId
      }
    });
    await prisma.resource.deleteMany({
      where: {
        userId: userId
      }
    })
    res.status(200).json({});
  } catch (error) {
    next(error);
  }
}

export const getResource =
async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resourceId = parseInt(req.params.resid as string);
    if (Number.isNaN(resourceId))
      throw new APIError("bad resource id", 400);

    const resource = await prisma.resource.findFirst({
      relationLoadStrategy: "join",
      include: {
        tags: {
          include: {
            tag: {
              omit: {
                userId: true
              }
            }
          },
          omit: {
            tagId: true,
            resourceId: true
          }
        }
      },
      where: {
        id: resourceId
      }
    });
    if (resource == null)
      res.status(404).json({
        message: "such resource does not exist"
      });
    res.status(200).json({
      id: resource?.id,
      url: resource?.url,
      userId: resource?.userId,
      tags: resource?.tags.map(v => v.tag)
    });
  } catch (error) {
    next(error);
  }
}

export const putResource =
async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loggedUid = await authUser(req);
    const resourceId = parseInt(req.params.resid as string);
    if (Number.isNaN(resourceId))
      throw new APIError("bad resource id", 400);

    const resource = await prisma.resource.findFirst({
      where: {
        id: resourceId
      }
    });
    if (resource == null)
      res.status(404).json({
        message: "such resource does not exist"
      });

    const userId = resource?.userId;
    if (loggedUid != userId) throw new APIError('not authorized', 401);

    const url = (req.body as PostResourceRequest).url;
    if (!validateUrl(url))
      throw new APIError("invalid url", 400);

    const updatedResource = await prisma.resource.update({
      where: {
        id: resourceId
      },
      data: {
        url: url
      },
      relationLoadStrategy: "join",
      include: {
        tags: {
          include: {
            tag: {
              omit: {
                userId: true
              }
            }
          },
          omit: {
            tagId: true,
            resourceId: true
          }
        }
      }
    });
    res.status(200).json({
      id: updatedResource?.id,
      url: updatedResource?.url,
      userId: updatedResource?.userId,
      tags: updatedResource?.tags.map(v => v.tag)
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code == PrismaError.UniqueConstraintFailed)
        res.status(409).json({
          message: "such resource for the given user already exists"
        });
    }
    next(error);
  }
}
