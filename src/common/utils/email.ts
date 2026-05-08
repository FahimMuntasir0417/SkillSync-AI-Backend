import ejs from "ejs";
import fs from "node:fs";
import path from "node:path";
import status from "http-status";
import nodemailer from "nodemailer";

import { AppError } from "../errors/AppError.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

type SendEmailPayload = {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, unknown>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
};

const ensureEmailConfig = (): void => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new AppError(
      status.SERVICE_UNAVAILABLE,
      "Email service is not configured",
    );
  }
};

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: Number(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const resolveTemplatePath = (templateName: string): string => {
  const templateFile = `${templateName}.ejs`;
  const candidates = [
    path.join(process.cwd(), "src", "common", "templates", templateFile),
    path.join(process.cwd(), "src", "templates", templateFile),
    path.join(process.cwd(), "common", "templates", templateFile),
    path.join(process.cwd(), "templates", templateFile),
    path.join(process.cwd(), "dist", "common", "templates", templateFile),
    path.join(process.cwd(), "dist", "templates", templateFile),
    path.join(process.cwd(), ".dist", "common", "templates", templateFile),
    path.join(process.cwd(), ".dist", "templates", templateFile),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Email template not found. Checked: ${candidates.join(", ")}`,
  );
};

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments,
}: SendEmailPayload): Promise<void> => {
  try {
    ensureEmailConfig();

    const templatePath = resolveTemplatePath(templateName);
    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
      attachments,
    });

    logger.info({ to, messageId: info.messageId }, "Email sent");
  } catch (error: unknown) {
    logger.error({ error, to }, "Email sending failed");

    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
