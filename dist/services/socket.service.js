"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const logger_1 = __importDefault(require("../utils/logger"));
const repository_1 = require("../repository/base/repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const messageRepository = new repository_1.Repository(prisma_1.default?.message);
index_1.io.on("connection", (socket) => {
    logger_1.default.info("User connected!");
    socket.on("joinRoom", async (data) => {
        const { userId, roomId, username } = data;
        try {
            socket.join(roomId);
            socket.data.username = username;
            socket.data.userId = userId;
            socket.data.roomId = roomId;
            logger_1.default.info(`${username} joined ${roomId}`);
            // Broadcast to users that someone joined the room
            socket.to(roomId).emit("user_joined", {
                username,
                message: `${username} joined ${roomId}`,
            });
            const socketInRooms = await index_1.io.in(roomId).fetchSockets();
            // Broadcast the amount of users in a room
            index_1.io.to(roomId).emit("userCounts", {
                user_counts: socketInRooms.length,
            });
        }
        catch (error) {
            logger_1.default.info(`Something went wrong with "joinRoom" socket: ${error}`);
            socket.emit("error", { message: "Failed to join room" });
        }
    });
    socket.on("sendMessage", async (data) => {
        const { content, Files, senderId, roomId } = data;
        try {
            const messagePayloadData = {
                sender: {
                    connect: {
                        id: senderId,
                    },
                },
                content,
                Files,
                room: {
                    connect: {
                        id: roomId,
                    },
                },
            };
            const newMessage = await messageRepository.create(messagePayloadData);
            logger_1.default.info(newMessage);
            index_1.io.to(roomId).emit("newMessages", {
                id: newMessage?.id,
                content: newMessage?.content,
                Files: newMessage?.Files,
                senderId: newMessage?.senderId,
                roomId: newMessage?.roomId,
            });
            logger_1.default.info(`Message broadcast to roomm: ${roomId}`);
        }
        catch (error) {
            logger_1.default.info(`Something went wrong with "sendMmessage" socket: ${error}`);
            socket.emit("error", { message: "Failed to send message" });
        }
    });
    socket.on("typing", ({ username, roomId }) => {
        socket.to(roomId).emit("userTyping", { username });
    });
    socket.on("stopTyping", ({ roomId }) => {
        socket.to(roomId).emit("userStoppedTyping");
    });
    socket.on("deleteMessage", async (data) => {
        const { messageId, userId, roomId } = data;
        try {
            const message = await messageRepository.findById(messageId, undefined, "message");
            if (message?.senderId === userId) {
                await messageRepository.delete(messageId);
                index_1.io.to(roomId).emit("messageDeleted", { messageId });
            }
        }
        catch (error) {
            logger_1.default.info(`Something went wrong with "deleteMessage" socket: ${error}`);
            socket.emit("error", { message: "Failed to delete message" });
        }
    });
    socket.on("disconnect", async () => {
        const { username, roomId } = socket.data;
        if (username && roomId) {
            // Notify others
            index_1.io.to(roomId).emit("userLeft", {
                username,
                message: `${username} left the chat`,
            });
            // Update user count
            const socketsInRoom = await index_1.io.in(roomId).fetchSockets();
            index_1.io.to(roomId).emit("userCounts", {
                user_counts: socketsInRoom.length,
            });
        }
        console.log("User disconnected:", socket.id);
    });
});
