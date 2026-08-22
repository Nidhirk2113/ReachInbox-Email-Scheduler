import { Response } from "express";

import {
  scheduleEmails,
  getCampaigns,
  getScheduledEmails,
  getSentEmails,
} from "../services/email.service.js";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

/* ============================================================
   CREATE / SCHEDULE CAMPAIGN
============================================================ */

export async function scheduleEmailController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const {
      subject,
      body,
      recipients,
      startTime,
      delayMs,
      hourlyLimit,
    } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (
      !subject ||
      typeof subject !== "string" ||
      !body ||
      typeof body !== "string" ||
      !Array.isArray(recipients) ||
      recipients.length === 0 ||
      !startTime
    ) {
      return res.status(400).json({
        error: "Invalid scheduling request",
      });
    }

    const cleanedRecipients = recipients
      .map((recipient: unknown) =>
        String(recipient).trim()
      )
      .filter(Boolean);

    if (cleanedRecipients.length === 0) {
      return res.status(400).json({
        error:
          "At least one valid recipient is required",
      });
    }

    const parsedStartTime =
      new Date(startTime);

    if (
      Number.isNaN(
        parsedStartTime.getTime()
      )
    ) {
      return res.status(400).json({
        error: "Invalid start time",
      });
    }

    const campaign =
      await scheduleEmails({
        userId,
        subject: subject.trim(),
        body: body.trim(),
        recipients: cleanedRecipients,
        startTime: parsedStartTime,
        delayMs: Number(
          delayMs ?? 2000
        ),
        hourlyLimit: Number(
          hourlyLimit ?? 200
        ),
      });

    return res.status(201).json({
      message:
        "Emails scheduled successfully",
      campaign,
    });
  } catch (error) {
    console.error(
      "Schedule email error:",
      error
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to schedule emails",
    });
  }
}

/* ============================================================
   GET CAMPAIGNS
============================================================ */

export async function getCampaignsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const campaigns =
      await getCampaigns(userId);

    return res.json({
      campaigns,
    });
  } catch (error) {
    console.error(
      "Failed to fetch campaigns:",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch campaigns",
    });
  }
}

/* ============================================================
   GET SCHEDULED EMAILS
============================================================ */

export async function getScheduledEmailsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const emails =
      await getScheduledEmails(userId);

    return res.json({
      emails,
    });
  } catch (error) {
    console.error(
      "Failed to fetch scheduled emails:",
      error
    );

    return res.status(500).json({
      error:
        "Failed to fetch scheduled emails",
    });
  }
}

/* ============================================================
   GET SENT / FAILED EMAILS
============================================================ */

export async function getSentEmailsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const emails =
      await getSentEmails(userId);

    return res.json({
      emails,
    });
  } catch (error) {
    console.error(
      "Failed to fetch sent emails:",
      error
    );

    return res.status(500).json({
      error:
        "Failed to fetch sent emails",
    });
  }
}