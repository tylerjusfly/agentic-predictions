// Import required modules
import dotenv from "dotenv";
import app from "./app";
import logger from "./utils/logger";
import { closeDatabase, initializeDatabase } from "./utils/db";
import { emailService } from "./modules/notification/nodemailer";

// Load environment variables
dotenv.config();

// General error handlers
process.on("unhandledRejection", (err: any) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection 😢");
});

process.on("uncaughtException", (err: any) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception 😪");
});

function validateEnvironment() {
  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER is not set.");
  }

  if (!process.env.SMTP_PASS) {
    throw new Error("SMTP_PASS is not set.");
  }

  if (process.env.LLM_PROVIDER !== "GEMINI" && !process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  if (process.env.LLM_PROVIDER === "GEMINI" && !process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  if (!process.env.CHROMA_URL) {
    throw new Error("CHROMA_URL is not set.");
  }
}

// Shutdown the connection
async function shutdown(): Promise<void> {
  try {
    console.log("Closing SQLite connection...");
    closeDatabase();
    await emailService.close();
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Listen for SIGINT and SIGTERM signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Get port from environment variable or use default
const port = process.env.API_PORT || 3000;
// Start the server
app.listen(port, async () => {
  validateEnvironment();
  initializeDatabase();
  const emailInitialized = await emailService.initialize();

  if (!emailInitialized) {
    console.warn("⚠️  App started but email service is not available");
    // You can decide whether to continue or exit based on your requirements
  }

  logger.info(`🚀 Server is running at http://localhost:${port}`);
  logger.debug("Debug logging is enabled");
});
