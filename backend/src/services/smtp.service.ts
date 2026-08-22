import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const { data, error } = await resend.emails.send({
    from: "ReachInbox Scheduler <onboarding@resend.dev>",
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
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`✓ Email sent to ${recipient}`);
  console.log(`Resend message ID: ${data?.id}`);

  return {
    messageId: data?.id ?? messageId ?? null,
    previewUrl: null,
  };
}
