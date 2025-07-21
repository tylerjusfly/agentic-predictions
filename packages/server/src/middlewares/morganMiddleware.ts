import morgan from "morgan";
import logger from "../utils/logger";

// Override the stream method by telling Morgan to use our custom logger instead of the console.log
const stream = {
  // Use the http severity
  write: (message: string) => logger.http(message.trim()),
};

// Build the morgan middleware
const morganMiddleware = morgan(
  // Define message format string (this is the standard Apache combined format)
  ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  // Options: override stream
  { stream }
);

export default morganMiddleware;