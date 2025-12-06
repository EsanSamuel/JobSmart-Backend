import express from "express";
import { ApiError, ApiSuccess } from "../utils/response";
import { Prisma } from "../generated/prisma/client";
import { UserService } from "../services/user.service";
import logger from "../utils/logger";
import { getPresignedUrl } from "../libs/aws";
import { CVParser } from "../libs/pdf-parser";
import { AuthService } from "../services/auth.service";
import { RoomService } from "../services/room.service";

const roomService = new RoomService();

class RoomController {
  static async createRoom(req: express.Request, res: express.Response) {
    try {
      const { userId1, userId2 } = req.body;

      const data = {
        userId1,
        userId2,
      };

      const room = await roomService.createRoom(data);
      logger.info(room);
      if (room) {
        res
          .status(201)
          .json(new ApiSuccess(201, "Room created successfully", room));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getRoom(req: express.Request, res: express.Response) {
    const userId = req.params.id;
    try {
      const room = await roomService.getRooms(userId);
      if (room) {
        res
          .status(200)
          .json(
            new ApiSuccess(200, `${userId} Rooms fetched successfully`, room)
          );
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getRoomById(req: express.Request, res: express.Response) {
    const id = req.params.id;
    try {
      const room = await roomService.getRoomById(id);
      if (room) {
        res
          .status(200)
          .json(new ApiSuccess(200, "Room fetched successfully", room));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }
}

export default RoomController;
