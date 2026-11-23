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

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "A bearer token is required" });
  }
  const token = authHeader.slice("Bearer ".length).trim();
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    logger.error("JWT_SECRET is not configured");
    return res.status(500).json({ message: "Authentication is unavailable" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    logger.error({ err: error }, "Authentication middleware failed");
    return res.status(500).json({ message: "Authentication failed" });
  }
};

export default authMiddleware;
