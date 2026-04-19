/**
 * Debbie email sender — Resend wrapper with brand defaults.
 *
 * Usage:
 *   import { sendEmail } from "@/core/email/send";
 *   import WelcomeEmail from "@/core/email/templates/welcome";
 *   await sendEmail({
 *     to: "user@example.com",
 *     subject: "Welcome to AIOW",
 *     react: WelcomeEmail({ name: "Richard" }),
 *     brand: "aiow",
 *   });
 *
 * Env:
 *   RESEND_API_KEY
 *   EMAIL_FROM_AIOW     — "AIOW <hello@aiow.ai>"
 *   EMAIL_FROM_DEBBIE   — "Debbie <hi@debbie.bot>"
 */

type Brand = "debbie" | "aiow" | "h3alth" | "mew" | "handsome";

export interface EmailRequest {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  replyTo?: string;
  brand?: Brand;
  tags?: { name: string; value: string }[];
}

const FROM_ENV: Record<Brand, string> = {
  debbie:   "EMAIL_FROM_DEBBIE",
  aiow:     "EMAIL_FROM_AIOW",
  h3alth:   "EMAIL_FROM_H3ALTH",
  mew:      "EMAIL_FROM_MEW",
  handsome: "EMAIL_FROM_HANDSOME",
};

export async function sendEmail(req: EmailRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
  const brand = req.brand || "debbie";
  const from = process.env[FROM_ENV[brand]] || "Debbie <hi@debbie.bot>";

  // Dynamic import to avoid bundling Resend for projects that don't need it
  // @ts-expect-error — optional peer dep; install `resend` in project if using this
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const payload: Parameters<typeof resend.emails.send>[0] = {
    from,
    to: Array.isArray(req.to) ? req.to : [req.to],
    subject: req.subject,
    replyTo: req.replyTo,
    tags: req.tags,
  };
  if (req.react) payload.react = req.react;
  else if (req.html) payload.html = req.html;
  else if (req.text) payload.text = req.text;
  else throw new Error("email body required (react|html|text)");

  return resend.emails.send(payload);
}
