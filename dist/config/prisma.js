"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../generated/prisma/client");
const client = globalThis.prisma || new client_1.PrismaClient();
if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client;
}
exports.default = client;
