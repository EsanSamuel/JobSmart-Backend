import jwt from "jsonwebtoken";
import express from "express";
import logger from "../utils/logger";

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
  };
}

const authMiddleware = (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader?.split(" ")[1];

  try {
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong with authMiddleware" });
  }
};

export default authMiddleware;
