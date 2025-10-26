import express from "express";
import { UserService } from "../../services/user.service";
import UserController from "../../controllers/user.controller";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const userRouter = express.Router();

userRouter.post("/", UserController.createUser);
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

export default userRouter;
