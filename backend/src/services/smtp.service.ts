import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export async function getSmtpTransporter() {
  if (transporter) {
    return transporter;
  }

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("✓ Ethereal SMTP configured");
  console.log(`Ethereal user: ${testAccount.user}`);

  return transporter;
}

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
  const transport = await getSmtpTransporter();

  const info = await transport.sendMail({
    from: `"ReachInbox Scheduler" <scheduler@reachinbox.test>`,
    to: recipient,
    subject,
    text: body,

    // Deterministic application-level Message-ID.
    ...(messageId ? { messageId } : {}),
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  console.log(`✓ Email sent to ${recipient}`);

  if (previewUrl) {
    console.log(`Preview: ${previewUrl}`);
  }

  console.log(`Message ID: ${info.messageId}`);

  return {
    messageId: info.messageId,
    previewUrl:
    typeof previewUrl === "string"
      ? previewUrl
      : null,
   };
}