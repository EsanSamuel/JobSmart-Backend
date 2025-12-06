import express from "express";
import { UserService } from "../../services/user.service";
import UserController from "../../controllers/user.controller";
import multer from "multer";
import RoomController from "../../controllers/room.controller";

const roomRouter = express.Router();

roomRouter.post("/", RoomController.createRoom);
roomRouter.get("/:id", RoomController.getRoomById);
roomRouter.get("/:id/user", RoomController.getRoom);

export default roomRouter;
