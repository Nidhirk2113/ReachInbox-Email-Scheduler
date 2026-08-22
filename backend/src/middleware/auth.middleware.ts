import { Request, Response, NextFunction } from "express";

import {
  verifySessionToken,
} from "../services/auth.service.js";

export interface AuthenticatedRequest
  extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.reachinbox_session;

    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const { userId } =
      verifySessionToken(token);

    req.userId = userId;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    return res.status(401).json({
      error: "Invalid or expired session",
    });
  }
}