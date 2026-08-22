import { prisma } from "../config/database.js";
import { emailQueue } from "../queues/email.queue.js";
import { env } from "../config/env.js";
import { reserveEmailSlots } from "./scheduler.service.js";

interface ScheduleEmailInput {
  userId: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: Date;
  delayMs: number;
  hourlyLimit: number;
}

export async function scheduleEmails(input: ScheduleEmailInput) {
  const {
    userId,
    subject,
    body,
    recipients,
    startTime,
    delayMs,
    hourlyLimit,
  } = input;

  if (recipients.length === 0) {
    throw new Error("At least one recipient is required");
  }

  // Never allow a campaign to exceed the system-wide limit.
  const effectiveHourlyLimit = Math.min(
    hourlyLimit,
    env.maxEmailsPerHour
  );

  // Never allow the campaign to send faster than the
  // configured system minimum.
  const effectiveDelay = Math.max(
    delayMs,
    env.minEmailDelayMs
  );

  // Reserve distributed delivery slots through Redis.
  const scheduledSlots = await reserveEmailSlots(
    startTime,
    recipients.length,
    effectiveDelay,
    effectiveHourlyLimit
  );

  // 1. Store campaign + emails in PostgreSQL.
  const result = await prisma.$transaction(async (tx) => {
    const sender = await tx.sender.findFirst();

    if (!sender) {
      throw new Error("No email sender configured");
    }

    const campaign = await tx.campaign.create({
      data: {
        userId,
        subject,
        body,
        startTime,
        delayMs: effectiveDelay,
        hourlyLimit: effectiveHourlyLimit,
      },
    });

    const createdEmails = await Promise.all(
      recipients.map((recipient, index) =>
        tx.email.create({
          data: {
            campaignId: campaign.id,
            senderId: sender.id,
            recipient,
            subject,
            body,
            scheduledAt: scheduledSlots[index],
          },
        })
      )
    );

    return {
      campaign,
      emails: createdEmails,
    };
  });

  // 2. Create one persistent BullMQ delayed job per email.
  await Promise.all(
    result.emails.map((email) =>
      emailQueue.add(
        `email-${email.id}`,
        {
          emailId: email.id,
        },
        {
          jobId: email.id,

          delay: Math.max(
            0,
            email.scheduledAt.getTime() - Date.now()
          ),
        }
      )
    )
  );

  return result.campaign;
}

export async function getScheduledEmails(userId: string) {
  return prisma.email.findMany({
    where: {
      campaign: {
        userId,
      },
      status: "SCHEDULED",
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
}

export async function getSentEmails(userId: string) {
  return prisma.email.findMany({
    where: {
      campaign: {
        userId,
      },
      status: {
        in: ["SENT", "FAILED"],
      },
    },
    orderBy: {
      sentAt: "desc",
    },
  });
}

export async function getCampaigns(userId: string) {
  return prisma.campaign.findMany({
    where: {
      userId,
    },
    include: {
      emails: {
        select: {
          id: true,
          recipient: true,
          status: true,
          scheduledAt: true,
          sentAt: true,
        },
        orderBy: {
          scheduledAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}