import { Worker, Job } from "bullmq";
import { redis } from "../config/redis.js";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { sendEmail } from "../services/smtp.service.js";

interface EmailJobData {
  emailId: string;
}

const worker = new Worker<EmailJobData>(
  "email-scheduler",

  async (job: Job<EmailJobData>) => {
    const { emailId } = job.data;

    console.log(`Processing email ${emailId}`);

    const email = await prisma.email.findUnique({
      where: {
        id: emailId,
      },
    });

    if (!email) {
      throw new Error(`Email ${emailId} not found`);
    }

    // Idempotency guard.
    if (email.status === "SENT") {
      console.log(
        `Email ${emailId} already sent. Skipping.`
      );
      return;
    }

    await prisma.email.update({
      where: {
        id: emailId,
      },
      data: {
        status: "PROCESSING",
        attempts: {
          increment: 1,
        },
        errorMessage: null,
      },
    });

    try {
      const result = await sendEmail({
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,

        // Stable Message-ID across retries.
        messageId: `<${email.id}@reachinbox.local>`,
      });

      await prisma.email.update({
        where: {
          id: emailId,
        },
        data: {
          status: "SENT",
          sentAt: new Date(),
          messageId: result.messageId,
          previewUrl: result.previewUrl,
          errorMessage: null,
        },
      });

      console.log(
        `✓ Email ${emailId} marked as SENT`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown SMTP error";

      console.error(
        `✗ Email ${emailId} failed: ${message}`
      );

      // Important:
      // Re-throw so BullMQ performs its configured retry.
      throw error;
    }
  },

  {
    connection: redis,
    concurrency: env.workerConcurrency,
  }
);

worker.on("failed", async (job, error) => {
  if (!job) {
    return;
  }

  const maxAttempts = job.opts.attempts ?? 1;

  console.error(
    `✗ Job ${job.id} failed ` +
      `(attempt ${job.attemptsMade}/${maxAttempts}):`,
    error.message
  );

  // Only permanently fail after BullMQ has
  // exhausted all retry attempts.
  if (job.attemptsMade >= maxAttempts) {
    try {
      await prisma.email.update({
        where: {
          id: job.data.emailId,
        },
        data: {
          status: "FAILED",
          errorMessage: error.message,
        },
      });

      console.log(
        `✗ Email ${job.data.emailId} permanently FAILED`
      );
    } catch (dbError) {
      console.error(
        "Failed to update email status:",
        dbError
      );
    }
  }
});

worker.on("completed", (job) => {
  console.log(`✓ Job ${job.id} completed`);
});

console.log(
  `✓ Email worker started with concurrency ${env.workerConcurrency}`
);