import express, { Request, Response, NextFunction } from "express";
import cors from 'cors';
import logger from "./utils/logger";
import morganMiddleware from "./middlewares/morganMiddleware";
import { v1Router } from "./routes/v1/routes";
// import { toNodeHandler } from 'better-auth/node';
// import { auth } from "./modules/auth/googleAuth";

const app = express();

// Apply morgan middleware for HTTP request logging
app.use(morganMiddleware);

app.use(express.json({ limit: '1024mb' }));

// npm install express -w apps/backend
// app.all('/api/auth/{*any}', toNodeHandler(auth))
// app.disable("")

// Add Cors middle ware
app.use(cors({
		origin: '*',
		methods: ['GET', 'POST', 'PATCH', 'DELETE'],
		credentials: true,
	}));

// Add request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`);
  next();
});

// Add error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error processing ${req.method} request to ${req.url}`);
  logger.error(err.stack || err.message);
  res.status(500).json({ error: "Internal Server Error" });
});


app.use('/v1', v1Router);

// Example route with logging
app.get("/health", (_req: Request, res: Response) => {
  logger.info("Health check endpoint accessed");
  res.json({ status: "healthy" });
});

// Log when the app is created
logger.info("Express app initialized");

export default app;