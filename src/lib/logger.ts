import winston from "winston";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define different colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Tell winston that we want to link specific colors with specific log levels
winston.addColors(colors);

// Define which level to use based on the environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "warn";
};

// Custom format
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  // Add colors
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports Winston should use to print the logs
const transports = [
  new winston.transports.Console(),
];

// Create and export the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;