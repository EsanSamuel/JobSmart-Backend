import { Prisma, Room } from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import logger from "../utils/logger";

const roomRepository = new Repository<Room>(prisma?.room);

export class RoomService {
  async createRoom(data: { userId1: string; userId2: string }) {
    try {
      const roomExists = await prisma?.room.findFirst({
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
      } satisfies Prisma.RoomCreateInput;
      if (!roomExists) {
        const room = await roomRepository.create(roomPayload);
        return room as Room;
      } else {
        return roomExists;
      }
    } catch (error) {
      logger.info("Error Creating Room");
    }
  }

  async getRooms(userId: string) {
    try {
      const rooms = await roomRepository.findAll(userId, "rooms");
      return rooms;
    } catch (error) {
      logger.info("Error getting Room");
    }
  }

  async getRoomById(id: string) {
    try {
      const room = await roomRepository.findById(id, undefined, "room");
      return room;
    } catch (error) {
      logger.info("Error getting Room");
    }
  }
}
