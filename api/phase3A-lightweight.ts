// Phase 3A: Test lightweight serverless router
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from '../server/serverlessRouter'; // Use lightweight router
import { createContext } from '../server/_core/context';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Testing Phase 3A: Lightweight tRPC router');
    
    // Create Express app
    const app = express();
    app.use(express.json({ limit: "50mb" }));
    
    // Add tRPC middleware with lightweight router
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );
    
    // Handle the request with Express
    return app(req as any, res as any);
    
  } catch (error) {
    console.error('❌ Phase 3A failed:', error);
    res.status(500).json({ 
      error: 'Phase 3A failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}