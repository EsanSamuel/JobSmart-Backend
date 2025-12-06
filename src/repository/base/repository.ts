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
      | "AllJobs"
      | "recruiterJob"
      | "bookmark"
      | "appliedJobs"
      | "rooms"
      | "bookmarkedJobs",
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      jobType?: string;
      location?: string;
      title?: string;
      date?: Date;
      company?: string;
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
                        mode: "insensitive",
                      },
                    },
                    {
                      email: {
                        contains: params.filter,
                        mode: "insensitive",
                      },
                    },
                    {
                      uniqueName: {
                        contains: params.filter,
                        mode: "insensitive",
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
                        mode: "insensitive",
                      },
                    },
                    {
                      location: {
                        contains: params.filter,
                        mode: "insensitive",
                      },
                    },
                    {
                      salaryRange: {
                        contains: params.filter,
                        mode: "insensitive",
                      },
                    },
                    {
                      skills: {
                        has: params.filter,
                      },
                    },
                    {
                      requirements: {
                        has: params.filter,
                      },
                    },
                    {
                      responsibilities: {
                        has: params.filter,
                      },
                    },
                    {
                      benefits: {
                        has: params.filter,
                      },
                    },
                  ],
                }
              : {}),

            ...(params?.company
              ? {
                  createdBy: {
                    contains: params.company,
                    mode: "insensitive",
                  } as Prisma.UserScalarRelationFilter,
                }
              : {}),

            ...(params?.location
              ? {
                  location: {
                    contains: params.location,
                    mode: "insensitive",
                  },
                }
              : {}),

            ...(params?.jobType
              ? {
                  jobType: params.jobType as Prisma.EnumJobTypeFilter,
                }
              : {}),

            // isArchived: false,
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
            Resume: true,
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
                        mode: "insensitive",
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
                        mode: "insensitive",
                      },
                    },
                    {
                      requirements: {
                        hasSome: [params.filter],
                      },
                    },
                    {
                      responsibilities: {
                        hasSome: [params.filter],
                      },
                    },
                    {
                      benefits: {
                        hasSome: [params.filter],
                      },
                    },
                    {
                      salaryRange: {
                        contains: params.filter,
                        mode: "insensitive",
                      },
                    },
                  ],
                }
              : {}),
            ...(params?.company
              ? {
                  createdBy: {
                    contains: params.company,
                    mode: "insensitive",
                  } as Prisma.UserScalarRelationFilter,
                }
              : {}),
            ...(params?.location
              ? {
                  location: {
                    contains: params.jobType,
                    mode: "insensitive",
                  },
                }
              : {}),
            ...(params?.jobType
              ? {
                  jobType: {
                    contains: params.jobType,
                    mode: "insensitive",
                  } as Prisma.EnumJobTypeFilter,
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
        } satisfies Parameters<typeof prisma.job.findMany>[0]) as Promise<T[]>;

      case "recruiterJob":
        return this.prismaClient.job.findMany({
          where: {
            createdBy: {
              id: id,
            },
            ...(params?.filter
              ? {
                  OR: [
                    {
                      title: {
                        contains: params.filter,
                        mode: "insensitive",
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
                        mode: "insensitive",
                      },
                    },
                    {
                      requirements: {
                        hasSome: [params.filter],
                      },
                    },
                    {
                      responsibilities: {
                        hasSome: [params.filter],
                      },
                    },
                    {
                      benefits: {
                        hasSome: [params.filter],
                      },
                    },
                    {
                      salaryRange: {
                        contains: params.filter,
                        mode: "insensitive",
                      },
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
            Resume: {
              include: {
                user: true,
              },
            },
          },
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
        return this.prismaClient.resume.findMany({
          where: {
            user: {
              id: id,
            },
          },
          include: {
            user: true,
            job: true,
          },
        } satisfies Parameters<typeof prisma.resume.findMany>[0]) as Promise<
          T[]
        >;
      case "appliedJobs":
        return this.prismaClient.resume.findMany({
          where: {
            user: {
              id: id,
            },
            jobId: {
              not: null,
            },
          },
          include: {
            user: true,
            job: true,
          },
        } satisfies Parameters<typeof prisma.resume.findMany>[0]) as Promise<
          T[]
        >;

      case "matched":
        return this.prismaClient.match.findMany({
          where: {
            user: {
              id: id,
            },
          },
          include: {
            user: true,
            job: true,
          },
          orderBy: {
            createdAt: "desc",
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
            job: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        } satisfies Parameters<typeof prisma.resume.findMany>[0]) as Promise<
          T[]
        >;

      case "bookmark":
        return this.prismaClient.bookmark.findMany({
          where: {
            user: {
              id: id,
            },
          },
          include: {
            user: true,
            job: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        } satisfies Parameters<typeof prisma.bookmark.findMany>[0]) as Promise<
          T[]
        >;

      case "bookmarkedJobs":
        return this.prismaClient.bookmark.findMany({
          where: {
            jobId: id,
          },
          include: {
            user: true,
            job: true,
          },
        } satisfies Parameters<typeof prisma.bookmark.findMany>[0]) as Promise<
          T[]
        >;

      case "rooms":
        const userId = id;
        return this.prismaClient.room.findMany({
          where: {
            userIds: {
              has: userId,
            },
          },
          include: {
            users: true,
            messages: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        } satisfies Parameters<typeof prisma.room.findMany>[0]) as Promise<T[]>;

      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async findById(
    id?: string,
    email?: string,
    type?:
      | "accountRole"
      | "user"
      | "job"
      | "matched"
      | "bookmark"
      | "userExists"
      | "room"
      | "message"
  ): Promise<T | null> {
    switch (type) {
      case "userExists":
        const user = this.prismaClient.user.findUnique({
          where: {
            email: email,
          },
        } satisfies Parameters<typeof prisma.user.findUnique>[0]) as Promise<T | null>;
        return user;
      case "accountRole":
        return this.prismaClient.user.findUnique({
          where: {
            id: id,
          },
          select: {
            role: true,
          },
        } satisfies Parameters<typeof prisma.user.findUnique>[0]) as Promise<T | null>;

      case "user":
        logger.info(id);
        return this.prismaClient.user.findUnique({
          where: {
            id: id,
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
            Resume: {
              include: {
                user: true,
              },
            },
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

      case "bookmark":
        return this.prismaClient.bookmark.findUnique({
          where: {
            id: id,
          },
          include: {
            user: true,
            job: true,
          },
        } satisfies Parameters<typeof prisma.bookmark.findUnique>[0]) as Promise<T | null>;

      case "room":
        logger.info(id);
        return this.prismaClient.room.findUnique({
          where: {
            id: id,
          },
          include: {
            users: true,
            messages: true,
          },
        } satisfies Parameters<typeof prisma.room.findUnique>[0]) as Promise<T | null>;

      case "message":
        logger.info(id);
        return this.prismaClient.message.findUnique({
          where: {
            id: id,
          },
          include: {
            sender: true,
            room: true,
          },
        } satisfies Parameters<typeof prisma.message.findUnique>[0]) as Promise<T | null>;

      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async findFirst(
    id1?: string,
    id2?: string,
    type?: "resume" | "submitResume" | "matched" | "bookmark",
    url?: string
  ): Promise<Boolean> {
    switch (type) {
      case "resume":
        const existingResume = this.prismaClient.resume.findFirst({
          where: {
            user: {
              id: id1,
            },
            jobId: null,
          },
        } satisfies Parameters<typeof prisma.resume.findFirst>[0]) as Promise<Boolean>;
        return existingResume;

      case "submitResume":
        const Resume = this.prismaClient.resume.findFirst({
          where: {
            user: {
              id: id1,
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
              id: id2,
            },
            fileUrl: url,
          },
          include: {
            job: true,
          },
        } satisfies Parameters<typeof prisma.match.findFirst>[0]) as Promise<Boolean>;
        return matched;

      case "bookmark":
        const bookmark = this.prismaClient.bookmark.findFirst({
          where: {
            jobId: id1,
            user: {
              id: id2,
            },
          },
          include: {
            job: true,
          },
        } satisfies Parameters<typeof prisma.bookmark.findFirst>[0]) as Promise<Boolean>;
        return bookmark;

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
    return this.db.delete({
      where: {
        id,
      },
    });
  }
}
