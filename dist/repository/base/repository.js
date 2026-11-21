"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = __importDefault(require("../../utils/logger"));
class Repository {
    db;
    prismaClient;
    constructor(db, prismaClient = prisma_1.default) {
        this.db = db;
        this.prismaClient = prismaClient;
    }
    async create(data) {
        return this.db.create({ data });
    }
    async findAll(id, type, params) {
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
                    skip: params?.skip && params?.take
                        ? (params?.skip - 1) * params?.take
                        : undefined,
                    include: {
                        Job: true,
                        Match: true,
                        Resume: true,
                    },
                    orderBy: {
                        createdAt: params?.orderBy ?? "desc",
                    },
                });
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
                                },
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
                                jobType: params.jobType,
                            }
                            : {}),
                        // isArchived: false,
                    },
                    take: params?.take ?? undefined,
                    skip: params?.skip && params?.take
                        ? (params?.skip - 1) * params?.take
                        : undefined,
                    orderBy: {
                        createdAt: params?.orderBy ?? "desc",
                    },
                    include: {
                        createdBy: true,
                        Resume: true,
                    },
                });
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
                                },
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
                                },
                            }
                            : {}),
                        //isArchived: false,
                    },
                    take: params?.take ?? undefined,
                    skip: params?.skip && params?.take
                        ? (params?.skip - 1) * params?.take
                        : undefined,
                    orderBy: {
                        createdAt: params?.orderBy ?? "desc",
                    },
                });
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
                    skip: params?.skip && params?.take
                        ? (params?.skip - 1) * params?.take
                        : undefined,
                    orderBy: {
                        createdAt: params?.orderBy ?? "desc",
                    },
                    include: {
                        createdBy: true,
                        Resume: {
                            include: {
                                user: true,
                            },
                        },
                    },
                });
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
                    skip: params?.skip && params?.take
                        ? (params?.skip - 1) * params?.take
                        : undefined,
                    orderBy: {
                        createdAt: params?.orderBy ?? "desc",
                    },
                });
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
                });
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
                });
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
                });
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
                });
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
                });
            case "bookmarkedJobs":
                return this.prismaClient.bookmark.findMany({
                    where: {
                        jobId: id,
                    },
                    include: {
                        user: true,
                        job: true,
                    },
                });
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
                });
            default:
                throw new Error(`Unsupported type: ${type}`);
        }
    }
    async findById(id, email, type) {
        switch (type) {
            case "userExists":
                const user = this.prismaClient.user.findUnique({
                    where: {
                        email: email,
                    },
                });
                return user;
            case "accountRole":
                return this.prismaClient.user.findUnique({
                    where: {
                        id: id,
                    },
                    select: {
                        role: true,
                    },
                });
            case "user":
                logger_1.default.info(id);
                return this.prismaClient.user.findUnique({
                    where: {
                        id: id,
                    },
                    include: {
                        Job: true,
                        Match: true,
                        Resume: true,
                    },
                });
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
                });
            case "matched":
                return this.prismaClient.match.findUnique({
                    where: {
                        id: id,
                    },
                    include: {
                        job: true,
                    },
                });
            case "bookmark":
                return this.prismaClient.bookmark.findUnique({
                    where: {
                        id: id,
                    },
                    include: {
                        user: true,
                        job: true,
                    },
                });
            case "room":
                logger_1.default.info(id);
                return this.prismaClient.room.findUnique({
                    where: {
                        id: id,
                    },
                    include: {
                        users: true,
                        messages: true,
                    },
                });
            case "message":
                logger_1.default.info(id);
                return this.prismaClient.message.findUnique({
                    where: {
                        id: id,
                    },
                    include: {
                        sender: true,
                        room: true,
                    },
                });
            default:
                throw new Error(`Unsupported type: ${type}`);
        }
    }
    async findFirst(id1, id2, type, url) {
        switch (type) {
            case "resume":
                const existingResume = this.prismaClient.resume.findFirst({
                    where: {
                        user: {
                            id: id1,
                        },
                        jobId: null,
                    },
                });
                return existingResume;
            case "submitResume":
                const Resume = this.prismaClient.resume.findFirst({
                    where: {
                        user: {
                            id: id1,
                        },
                        jobId: id2,
                    },
                });
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
                });
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
                });
                return bookmark;
            default:
                return false;
        }
    }
    async update(id, data, type) {
        return this.db.update({
            where: {
                id,
            },
            data,
        });
    }
    async delete(id, type) {
        return this.db.delete({
            where: {
                id,
            },
        });
    }
}
exports.Repository = Repository;
