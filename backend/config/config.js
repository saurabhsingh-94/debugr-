import dotenv from "dotenv";
import path from "path";

dotenv.config();

const requiredEnv = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

const missingEnv = requiredEnv.filter((env) => !process.env[env]);

if (missingEnv.length > 0) {
  // Don't throw for Redis and SMTP in development, but warn
  if (process.env.NODE_ENV === "production" || missingEnv.some(e => e !== "REDIS_URL" && !e.startsWith("SMTP"))) {
    // Only throw if critical vars are missing
    const critical = ["DATABASE_URL", "JWT_SECRET"];
    if (critical.some(c => missingEnv.includes(c))) {
        throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
    }
  }
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  corsWhitelist: process.env.CORS_WHITELIST 
    ? process.env.CORS_WHITELIST.split(",") 
    : ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001"],
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  cashfree: {
    appId: process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SECRET_KEY,
    env: process.env.CASHFREE_ENVIRONMENT || "SANDBOX"
  }
};

export default config;
