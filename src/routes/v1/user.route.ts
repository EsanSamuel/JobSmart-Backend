import express from "express";
import { UserService } from "../../services/user.service";
import UserController from "../../controllers/user.controller";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const userRouter = express.Router();

userRouter.post("/", UserController.createUser);
userRouter.post("/login", UserController.login);
userRouter.post("/google-oauth", UserController.google_oauth);
userRouter.post(
  "/reset-password-request",
  UserController.reset_password_request
);
userRouter.post("/reset-password", UserController.reset_password);
userRouter.get("/", UserController.getUsers);
userRouter.get("/companies", UserController.getCompanies);
userRouter.post(
  "/resume",
  upload.fields([
    {
      name: "CV",
      maxCount: 1,
    },
  ]),
  UserController.uploadResume
);
userRouter.get("/:id", UserController.getUser);
userRouter.patch("/:id", UserController.updateUser);
userRouter.get("/applied-jobs/:id", UserController.appliedJobs);

export default userRouter;
