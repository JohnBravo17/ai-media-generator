// Working API replacement using lightweight serverless router
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import type { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from '../server/serverlessRouter'; // Use lightweight router
import { createContext } from '../server/_core/context';

// Create Express app for API handling
const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Serverless API is running'
  });
});

// tRPC API with lightweight router
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export handler for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}