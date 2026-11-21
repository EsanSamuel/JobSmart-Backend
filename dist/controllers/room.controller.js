"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const room_service_1 = require("../services/room.service");
const roomService = new room_service_1.RoomService();
class RoomController {
    static async createRoom(req, res) {
        try {
            const { userId1, userId2 } = req.body;
            const data = {
                userId1,
                userId2,
            };
            const room = await roomService.createRoom(data);
            logger_1.default.info(room);
            if (room) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "Room created successfully", room));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getRoom(req, res) {
        const userId = req.params.id;
        try {
            const room = await roomService.getRooms(userId);
            if (room) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, `${userId} Rooms fetched successfully`, room));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getRoomById(req, res) {
        const id = req.params.id;
        try {
            const room = await roomService.getRoomById(id);
            if (room) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Room fetched successfully", room));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
}
exports.default = RoomController;
