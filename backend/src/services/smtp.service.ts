import { Resend } from "resend";

interface SendEmailInput {
  recipient: string;
  subject: string;
  body: string;
  messageId?: string;
}

export async function sendEmail({
  recipient,
  subject,
  body,
  messageId,
}: SendEmailInput) {
  const demoMode =
    process.env.DEMO_MODE === "true";

  // Demo mode:
  // Do not call Resend. Simulate successful delivery.
  if (demoMode) {
    const demoMessageId =
      messageId ??
      `<demo-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}@reachinbox.local>`;

    console.log(
      `✓ DEMO MODE: Email marked as sent to ${recipient}`
    );

    console.log(
      `Demo Message ID: ${demoMessageId}`
    );

    return {
      messageId: demoMessageId,
      previewUrl: null,
    };
  }

  // Real Resend delivery
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured"
    );
  }

  const resend = new Resend(
    process.env.RESEND_API_KEY
  );

  const { data, error } =
    await resend.emails.send({
      from:
        "ReachInbox Scheduler <onboarding@resend.dev>",
      to: [recipient],
      subject,
      text: body,

      ...(messageId
        ? {
            headers: {
              "Message-ID": messageId,
            },
          }
        : {}),
    });

  if (error) {
    throw new Error(
      `Resend error: ${error.message}`
    );
  }

  console.log(
    `✓ Email sent to ${recipient}`
  );

  console.log(
    `Resend message ID: ${data?.id}`
  );

  return {
    messageId:
      data?.id ??
      messageId ??
      null,
    previewUrl: null,
  };
}