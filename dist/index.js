"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const logger_1 = __importDefault(require("./utils/logger"));
const cors_2 = __importDefault(require("./utils/cors"));
const user_route_1 = __importDefault(require("./routes/v1/user.route"));
const job_route_1 = __importDefault(require("./routes/v1/job.route"));
const bookmark_route_1 = __importDefault(require("./routes/v1/bookmark.route"));
const room_route_1 = __importDefault(require("./routes/v1/room.route"));
const match_route_1 = __importDefault(require("./routes/v1/match.route"));
require("./workers/match-job.worker");
require("./workers/submittedResume.worker");
require("./config/redis");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = 5000;
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            "https://jobsmart-two.vercel.app",
            "http://localhost:3000",
        ],
        methods: ["GET", "POST"],
    },
});
require("./services/socket.service");
app.use((0, compression_1.default)());
//app.use(limiter);
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(cors_2.default));
app.use("/api/v1/users", user_route_1.default);
app.use("/api/v1/jobs", job_route_1.default);
app.use("/api/v1/match", match_route_1.default);
app.use("/api/v1/bookmarks", bookmark_route_1.default);
app.use("/api/v1/rooms", room_route_1.default);
const startServer = () => {
    //AnalyzeMatch();
    //getEmbedding("What is Typescript");
    server.listen(PORT, () => logger_1.default.info(`Server is running at PORT ${PORT}`));
};
startServer();
