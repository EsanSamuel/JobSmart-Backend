import { createTransporter } from "../config/nodemailer";
import logger from "../utils/logger";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (email: string, token: string) => {
  try {
    const url = `http://localhost:3000/reset-password?token=${token}`;
    const { data, error } = await resend.emails.send({
      from: "JobSmart <noreply@mikaelsoninitiative.org>",
      to: email,
      subject: "Reset your password",
      html: `
  <div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">

    <h2 style="color: #111827; text-align: center; margin-bottom: 10px;">
      Reset Your Password
    </h2>

    <p style="color: #374151; font-size: 15px; text-align: center;">
      Hey there 👋
    </p>

    <p style="color: #374151; font-size: 15px; text-align: center; line-height: 1.5;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}"
         style="
           background-color: #2563eb;
           color: #ffffff;
           padding: 14px 30px;
           text-decoration: none;
           border-radius: 6px;
           font-weight: bold;
           display: inline-block;
           font-size: 16px;
         ">
        Reset Password
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; text-align: center; line-height: 1.4;">
      If you didn’t request this, you can safely ignore this email.
    </p>

  </div>
`,
    });

    if (error) {
      logger.error("Resend error:" + error);
      return;
    }

    logger.info("Message sent via Resend:" + data?.id);
  } catch (error) {
    logger.error("Failed to send email:" + error);
  }
};
