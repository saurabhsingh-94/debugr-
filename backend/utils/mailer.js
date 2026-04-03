import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter
// In production, you'd use SMTP keys. For now, we use a "Logger" transporter.
const transporter = nodemailer.createTransport({
  jsonTransport: true // This will log the "sent" email as JSON to the console
});

// To use real SMTP later, you'd do:
/*
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
*/

/**
 * Sends a transactional email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"Debugr Platform" <noreply@debugr.io>',
      to,
      subject,
      text,
      html
    });

    console.log(`[Email Sent] To: ${to} | Subject: ${subject}`);
    if (transporter.options.jsonTransport) {
      console.log("[Email Content]", info.message);
    }
    return info;
  } catch (err) {
    console.error(`[Email Error] Failed to send email to ${to}:`, err.message);
    // Don't throw - we don't want email failures to crash the API request
  }
};

export default sendEmail;
