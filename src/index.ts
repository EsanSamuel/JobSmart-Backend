import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import logger from "./utils/logger";
import corsOptions from "./utils/cors";
import user from "./routes/v1/user.route";
import jobs from "./routes/v1/job.route";
import bookmarks from "./routes/v1/bookmark.route";
import room from "./routes/v1/room.route";
import { AnalyzeMatch, getEmbedding } from "./ai/gemini";
import match from "./routes/v1/match.route";
import "./workers/match-job.worker";
import "./workers/submittedResume.worker";
import "./config/redis";
import limiter from "./middleware/rate-limiter";
import { Server, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);
const PORT = 5000;

export const io = new Server(server, {
  cors: {
    origin: [
      "https://jobsmart-two.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
  },
});

import "./services/socket.service";

app.use(compression());

//app.use(limiter);

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

app.use(cors(corsOptions));

app.use("/api/v1/users", user);

app.use("/api/v1/jobs", jobs);

app.use("/api/v1/match", match);

app.use("/api/v1/bookmarks", bookmarks);

app.use("/api/v1/rooms", room);

const startServer = () => {
  //AnalyzeMatch();
  //getEmbedding("What is Typescript");
  server.listen(PORT, () => logger.info(`Server is running at PORT ${PORT}`));
};

startServer();
