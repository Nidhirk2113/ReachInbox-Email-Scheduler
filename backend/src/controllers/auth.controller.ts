import { Request, Response } from "express";

import {
  verifyGoogleToken,
  findOrCreateGoogleUser,
  createSessionToken,
  getUserById,
} from "../services/auth.service.js";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

export async function googleLoginController(
  req: Request,
  res: Response
) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        error: "Google credential is required",
      });
    }

    const googleUser =
      await verifyGoogleToken(credential);

    const user =
      await findOrCreateGoogleUser(
        googleUser
      );

    const token =
      createSessionToken(user.id);

    res.cookie(
      "reachinbox_session",
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge:
          7 * 24 * 60 * 60 * 1000,
      }
    );

    return res.json({
      message: "Login successful",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error(
      "Google login failed:",
      error
    );

    return res.status(401).json({
      error:
        error instanceof Error
          ? error.message
          : "Google authentication failed",
    });
  }
}

export async function getCurrentUserController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const user =
      await getUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error(
      "Failed to get current user:",
      error
    );

    return res.status(500).json({
      error: "Failed to get current user",
    });
  }
}

export async function logoutController(
  _req: Request,
  res: Response
) {
  res.clearCookie(
    "reachinbox_session",
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    }
  );

  return res.json({
    message: "Logged out successfully",
  });
}
