"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const repository_1 = require("../repository/base/repository");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma_1 = __importDefault(require("../config/prisma"));
const roomRepository = new repository_1.Repository(prisma_1.default?.room);
class RoomService {
    async createRoom(data) {
        try {
            const roomExists = await prisma_1.default?.room.findFirst({
                where: {
                    userIds: {
                        hasEvery: [data.userId1, data.userId2],
                    },
                },
            });
            const roomPayload = {
                users: {
                    connect: [
                        {
                            id: data.userId1,
                        },
                        {
                            id: data.userId2,
                        },
                    ],
                },
            };
            if (!roomExists) {
                const room = await roomRepository.create(roomPayload);
                return room;
            }
            else {
                return roomExists;
            }
        }
        catch (error) {
            logger_1.default.info("Error Creating Room");
        }
    }
    async getRooms(userId) {
        try {
            const rooms = await roomRepository.findAll(userId, "rooms");
            return rooms;
        }
        catch (error) {
            logger_1.default.info("Error getting Room");
        }
    }
    async getRoomById(id) {
        try {
            const room = await roomRepository.findById(id, undefined, "room");
            return room;
        }
        catch (error) {
            logger_1.default.info("Error getting Room");
        }
    }
}
exports.RoomService = RoomService;
