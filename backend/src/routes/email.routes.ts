import { Router } from "express";

import {
  scheduleEmailController,
  getCampaignsController,
  getScheduledEmailsController,
  getSentEmailsController,
} from "../controllers/email.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

const router = Router();

/* ============================================================
   SCHEDULE EMAILS
============================================================ */

router.post(
  "/schedule",
  requireAuth,
  scheduleEmailController
);

/* ============================================================
   CAMPAIGNS
============================================================ */

router.get(
  "/campaigns",
  requireAuth,
  getCampaignsController
);

/* ============================================================
   SCHEDULED EMAILS
============================================================ */

router.get(
  "/scheduled",
  requireAuth,
  getScheduledEmailsController
);

/* ============================================================
   SENT EMAILS
============================================================ */

router.get(
  "/sent",
  requireAuth,
  getSentEmailsController
);

export default router;