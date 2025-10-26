import { PrismaClient } from "@prisma/client";
import { IRepository } from "./interface/repository.interface";
import prisma from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import logger from "../../utils/logger";

export class Repository<T> implements IRepository<T> {
  private readonly db: any;
  private readonly prismaClient: PrismaClient;

  constructor(db: any, prismaClient: PrismaClient = prisma) {
    this.db = db;
    this.prismaClient = prismaClient;
  }

  async create(data: any): Promise<T | null> {
    return this.db.create({ data });
  }

  async findAll(
    id?: string,
    type?:
      | "user"
      | "job"
      | "resume"
      | "matched"
      | "submittedResume"
      | "archivedJobs"
      | "AllJobs",
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      orderBy?: "asc" | "desc";
    }
  ): Promise<T[]> {
    switch (type) {
      case "user":
        return this.prismaClient.user.findMany({
          where: {
            ...(params?.filter
              ? {
                  OR: [
                    {
                      username: {
                        contains: params.filter,
                      },
                    },
                    {
                      email: {
                        contains: params.filter,
                      },
                    },
                    {
                      uniqueName: {
                        contains: params.filter,
                      },
                    },
                  ],
                }
              : {}),
          },
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          include: {
            Job: true,
            Match: true,
            Resume: true,
          },
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.UserOrderByWithRelationInput,
        } satisfies Parameters<typeof prisma.user.findMany>[0]) as Promise<T[]>;

      case "job":
        return this.prismaClient.job.findMany({
          where: {
            ...(params?.filter
              ? {
                  OR: [
                    {
                      title: {
                        contains: params.filter,
                      },
                    },
                    {
                      skills: {
                        hasSome: [params.filter],
                      },
                    },
                    {
                      location: {
                        contains: params.filter,
                      },
                    },
                    {
                      createdAt: new Date(params.filter),
                    },
                  ],
                }
              : {}),
            //isArchived: false,
          },
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.JobOrderByWithRelationInput,
          include: {
            createdBy: true,
          },
        } satisfies Parameters<typeof prisma.job.findMany>[0]) as Promise<T[]>;

      case "AllJobs":
        return this.prismaClient.job.findMany({
          where: {
            ...(params?.filter
              ? {
                  OR: [
                    {
                      title: {
                        contains: params.filter,
                      },
                    },
                    {
                      skills: {
                        hasSome: [params.filter],
                      },
                    },
                  ],
                }
              : {}),
          },
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.JobOrderByWithRelationInput,
        } satisfies Parameters<typeof prisma.job.findMany>[0]) as Promise<T[]>;

      case "archivedJobs":
        return this.prismaClient.job.findMany({
          where: {
            ...(params?.filter
              ? {
                  OR: [
                    {
                      title: {
                        contains: params.filter,
                      },
                    },
                    {
                      skills: {
                        hasSome: [params.filter],
                      },
                    },
                  ],
                }
              : {}),
            isArchived: true,
          },
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.JobOrderByWithRelationInput,
        } satisfies Parameters<typeof prisma.job.findMany>[0]) as Promise<T[]>;

      case "resume":
        return this.prismaClient.job.findMany({
          where: {
            user: {
              authId: id,
            },
          },
          include: {
            user: true,
          },
        } satisfies Parameters<typeof prisma.resume.findMany>[0]) as Promise<
          T[]
        >;

      case "matched":
        return this.prismaClient.match.findMany({
          where: {
            user: {
              authId: id,
            },
          },
          include: {
            user: true,
            job: true,
          },
        } satisfies Parameters<typeof prisma.match.findMany>[0]) as Promise<
          T[]
        >;

      case "submittedResume":
        return this.prismaClient.resume.findMany({
          where: {
            jobId: id,
          },
          include: {
            user: true,
            Job: true,
          },
        } satisfies Parameters<typeof prisma.resume.findMany>[0]) as Promise<
          T[]
        >;

      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async findById(
    id?: string,
    type?: "accountRole" | "user" | "job" | "matched"
  ): Promise<T | null> {
    switch (type) {
      case "accountRole":
        return this.prismaClient.user.findUnique({
          where: {
            authId: id,
          },
          select: {
            role: true,
          },
        } satisfies Parameters<typeof prisma.user.findUnique>[0]) as Promise<T | null>;

      case "user":
        logger.info(id);
        return this.prismaClient.user.findUnique({
          where: {
            authId: id,
          },
          include: {
            Job: true,
            Match: true,
            Resume: true,
          },
        } satisfies Parameters<typeof prisma.user.findUnique>[0]) as Promise<T | null>;

      case "job":
        return this.prismaClient.job.findUnique({
          where: {
            id: id,
          },
          include: {
            Match: true,
          },
        } satisfies Parameters<typeof prisma.job.findUnique>[0]) as Promise<T | null>;

      case "matched":
        return this.prismaClient.match.findUnique({
          where: {
            id: id,
          },
          include: {
            job: true,
          },
        } satisfies Parameters<typeof prisma.match.findUnique>[0]) as Promise<T | null>;

      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async findFirst(
    id1: string,
    id2?: string,
    type?: "resume" | "submitResume" | "matched"
  ): Promise<Boolean> {
    switch (type) {
      case "resume":
        const existingResume = this.prismaClient.resume.findFirst({
          where: {
            user: {
              authId: id1,
            },
          },
        } satisfies Parameters<typeof prisma.resume.findFirst>[0]) as Promise<Boolean>;
        return existingResume;

      case "submitResume":
        const Resume = this.prismaClient.resume.findFirst({
          where: {
            user: {
              authId: id1,
            },
            jobId: id2,
          },
        } satisfies Parameters<typeof prisma.resume.findFirst>[0]) as Promise<Boolean>;
        return Resume;

      case "matched":
        const matched = this.prismaClient.match.findFirst({
          where: {
            jobId: id1,
            user: {
              authId: id2,
            },
          },
          include: {
            job: true,
          },
        } satisfies Parameters<typeof prisma.match.findFirst>[0]) as Promise<Boolean>;
        return matched;

      default:
        return false;
    }
  }

  async update(id: string, data: Partial<T>, type?: string): Promise<T | null> {
    return this.db.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string, type?: string): Promise<Boolean> {
    return true;
  }
}
