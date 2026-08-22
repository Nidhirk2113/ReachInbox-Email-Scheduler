import { Router } from "express";

import {
  googleLoginController,
  getCurrentUserController,
  logoutController,
} from "../controllers/auth.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

const router = Router();

/*
 * Google Sign-In
 */
router.post(
  "/google",
  googleLoginController
);

/*
 * Get currently authenticated user
 */
router.get(
  "/me",
  requireAuth,
  getCurrentUserController
);

/*
 * Logout
 */
router.post(
  "/logout",
  logoutController
);

export default router;