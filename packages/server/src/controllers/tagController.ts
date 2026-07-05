import { prisma } from "../../lib/prisma.ts";
import type { Request, Response, NextFunction } from "express";
import { APIError } from "../middlewares/errorHandler.ts";
import { PrismaClientKnownRequestError } from "../../generated/prisma/internal/prismaNamespace.ts";
import { PrismaError } from "../middlewares/sqlErrorHandler.ts";
import { authUser } from "../middlewares/auth.ts";

interface PostTagRequest {
  tag: string
}

export const getAllTags =
async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allTags = await prisma.tag.findMany();
    res.json(allTags);
  } catch (error) {
    next(error);
  }
}

export const getUserTags =
async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.uid as string);
    if (Number.isNaN(userId))
      throw new APIError("bad user id", 400);

    const tags = await prisma.tag.findMany({
      where: {
        userId: userId
      }
    })
    res.json(tags);
  } catch (error) {
    next(error);
  }
}

export const getResourceTags =
async (req: Request, res: Response, next: NextFunction) => {
    try {
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

    const tags = await prisma.tagsOnResources.findMany({
      relationLoadStrategy: 'join',
      where: {
        resourceId: resourceId
      },
      include: {
        tag: {
          omit: {
            userId: true
          }
        }
      },
      omit: {
        resourceId: true,
        tagId: true
      }
    });
    res.json(tags.map(v => v.tag));
  } catch (error) {
    next(error);
  }
}

export const postResourceTag =
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

    const tag = (req.body as PostTagRequest).tag;
    const userTag = await prisma.tag.findFirst({
      where: {
        tag: tag
      }
    });

    if (userTag == null) {
      await prisma.tag.create({
        data: {
          tag: tag,
          userId: userId,
          resources: {
            create: { resourceId: resourceId }
          }
        }
      });
    } else {
      await prisma.tagsOnResources.create({
        data: {
          tagId: userTag.id,
          resourceId: resourceId
        }
      });
    }

    const finalResource = await prisma.resource.findFirst({
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
            resourceId: true,
            tagId: true
          }
        }
      },
      where: {
        id: resourceId
      }
    });
    res.status(200).json({
      id: finalResource?.id,
      url: finalResource?.url,
      userId: finalResource?.userId,
      tags: finalResource?.tags.map(v => v.tag)
    });
  } catch (error) {
    next(error);
  }
}

export const deleteTag =
async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loggedUid = await authUser(req);
    const tagId = parseInt(req.params.tagid as string);
    if (Number.isNaN(tagId))
      throw new APIError("bad tag id", 400);

    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId
      }
    });
    if (tag == null)
      res.status(404).json({
        message: "such tag does not exist"
      });
    const userId = tag?.userId;
    if (loggedUid != userId) throw new APIError('not authorized', 401);

    await prisma.tag.delete({
      where: {
        id: tagId
      }
    });
    res.status(200).json({});
  } catch (error) {
    next(error);
  }
}

export const deleteResourceTag =
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
    const tagId = parseInt(req.params.tagid as string);
    if (Number.isNaN(tagId))
      throw new APIError("bad tag id", 400);
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId
      }
    });
    if (tag == null)
      res.status(404).json({
        message: "such tag does not exist"
      });

    const userId = resource?.userId;
    if (loggedUid != userId) throw new APIError('not authorized', 401);

    const tagEntryCount = await prisma.tagsOnResources.count({
      where: {
        tagId: tagId
      }
    });

    if (tagEntryCount <= 1) {
      await prisma.tag.delete({
        where: {
          id: tagId
        }
      });
    } else {
      await prisma.tagsOnResources.delete({
        where: {
          resourceId_tagId: {
            tagId: tagId,
            resourceId: resourceId
          }
        }
      });
    }
    res.status(200).json({});
  } catch (error) {
    next(error);
  }
}

export const deleteAllUserTags =
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
    res.status(200).json({});
  } catch(error) {
    next(error);
  }
}

export const deleteAllResourceTags =
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
    await prisma.tag.deleteMany({
      where: {
        id: {
          in: tagsToDelete
        }
      }
    });
    await prisma.tagsOnResources.deleteMany({
      where: {
        resourceId: resourceId
      }
    });
    res.status(200).json({});
  } catch (error) {
    next(error);
  }
}

export const putTag =
async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loggedUid = await authUser(req);
    const tagId = parseInt(req.params.tagid as string);
    if (Number.isNaN(tagId))
      throw new APIError("bad tag id", 400);

    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId
      }
    });
    if (tag == null)
      res.status(404).json({
        message: "such tag does not exist"
      });

    const userId = tag?.userId;
    if (loggedUid != userId) throw new APIError('not authorized', 401);

    const tagString = (req.body as PostTagRequest).tag;

    const updatedTag = await prisma.tag.update({
      where: {
        id: tagId
      },
      data: {
        tag: tagString
      }
    });
    res.status(200).json(updatedTag);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code == PrismaError.UniqueConstraintFailed)
        res.status(409).json({
          message: "such tag for the given user already exists"
        });
    }
    next(error);
  }
}
