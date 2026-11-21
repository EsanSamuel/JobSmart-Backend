"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const createTransporter = async () => {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for others
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });
    return transporter;
};
exports.createTransporter = createTransporter;
