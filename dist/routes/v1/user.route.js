"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../../controllers/user.controller"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const userRouter = express_1.default.Router();
userRouter.post("/", user_controller_1.default.createUser);
userRouter.post("/login", user_controller_1.default.login);
userRouter.post("/google-oauth", user_controller_1.default.google_oauth);
userRouter.post("/reset-password-request", user_controller_1.default.reset_password_request);
userRouter.post("/verify-email", user_controller_1.default.verifyEmail);
userRouter.post("/verify-all-emails", user_controller_1.default.verifyAllEmails);
userRouter.post("/reset-password", user_controller_1.default.reset_password);
userRouter.get("/", user_controller_1.default.getUsers);
userRouter.get("/companies", user_controller_1.default.getCompanies);
userRouter.post("/resume", upload.fields([
    {
        name: "CV",
        maxCount: 1,
    },
]), user_controller_1.default.uploadResume);
userRouter.post("/profile-image", upload.fields([
    {
        name: "file",
        maxCount: 1,
    },
]), user_controller_1.default.uploadProfileImage);
userRouter.get("/:id", user_controller_1.default.getUser);
userRouter.patch("/:id", user_controller_1.default.updateUser);
userRouter.get("/applied-jobs/:id", user_controller_1.default.appliedJobs);
exports.default = userRouter;
