import { Socket } from "socket.io";
import { io } from "../index";
import logger from "../utils/logger";
import { Repository } from "../repository/base/repository";
import { Message, Prisma } from "../generated/prisma/client";

const messageRepository = new Repository<Message>(prisma?.message);

io.on("connection", (socket) => {
  logger.info("User connected!");

  socket.on("joinRoom", async (data) => {
    const { userId, roomId, username } = data;
    try {
      socket.join(roomId);
      socket.data.username = username;
      socket.data.userId = userId;
      socket.data.roomId = roomId;

      logger.info(`${username} joined ${roomId}`);

      // Broadcast to users that someone joined the room
      socket.to(roomId).emit("user_joined", {
        username,
        message: `${username} joined ${roomId}`,
      });

      const socketInRooms = await io.in(roomId).fetchSockets();

      // Broadcast the amount of users in a room
      io.to(roomId).emit("userCounts", {
        user_counts: socketInRooms.length,
      });
    } catch (error) {
      logger.info(`Something went wrong with "joinRoom" socket: ${error}`);
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
      } satisfies Prisma.MessageCreateInput;

      const newMessage = await messageRepository.create(messagePayloadData);
      logger.info(newMessage)

      io.to(roomId).emit("newMessages", {
        id: newMessage?.id,
        content: newMessage?.content,
        Files: newMessage?.Files,
        senderId: newMessage?.senderId,
        roomId: newMessage?.roomId,
      });

      logger.info(`Message broadcast to roomm: ${roomId}`);
    } catch (error) {
      logger.info(`Something went wrong with "sendMmessage" socket: ${error}`);
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
      const message = await messageRepository.findById(
        messageId,
        undefined,
        "message"
      );

      if (message?.senderId === userId) {
        await messageRepository.delete(messageId);

        io.to(roomId).emit("messageDeleted", { messageId });
      }
    } catch (error) {
      logger.info(`Something went wrong with "deleteMessage" socket: ${error}`);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  socket.on("disconnect", async () => {
    const { username, roomId } = socket.data;

    if (username && roomId) {
      // Notify others
      io.to(roomId).emit("userLeft", {
        username,
        message: `${username} left the chat`,
      });

      // Update user count
      const socketsInRoom = await io.in(roomId).fetchSockets();
      io.to(roomId).emit("roomInfo", {
        userCount: socketsInRoom.length,
      });
    }

    console.log("User disconnected:", socket.id);
  });
});
