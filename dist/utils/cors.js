"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://jobsmart-two.vercel.app",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
exports.default = corsOptions;
