import nodemailer from "nodemailer";
import config from "../config/config.js";
import logger from "./logger.js";

/**
 * Creates a transporter based on environment configuration.
 * Falls back to jsonTransport for development/testing if no SMTP provided.
 */
const createTransporter = () => {
  const { smtp } = config;
  
  if (smtp.host && smtp.user && smtp.pass) {
    logger.info(`📧 Using Real SMTP: ${smtp.host}`);
    return nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port || 587,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      tls: {
        rejectUnauthorized: true
      }
    });
  }

  logger.warn("⚠️ No SMTP credentials found. Emails will be logged to console in JSON format.");
  return nodemailer.createTransport({
    jsonTransport: true
  });
};

const transporter = createTransporter();

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
      from: `"Debugr Platform" <${config.smtp.user || "noreply@debugr.io"}>`,
      to,
      subject,
      text,
      html
    });

    logger.info(`[Email Sent] To: ${to} | Subject: ${subject}`);
    
    if (transporter.options.jsonTransport) {
      logger.debug(`[Email Mock Content] ${JSON.stringify(info.message)}`);
    }
    
    return info;
  } catch (err) {
    logger.error(`[Email Error] Failed to send email to ${to}: ${err.message}`);
    // Non-blocking error: don't throw, just log
    return null;
  }
};

export default sendEmail;
