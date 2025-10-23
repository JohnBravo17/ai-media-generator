// Phase 2E: Test server imports (the likely culprit)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import type { Request, Response } from "express";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// This is where it likely breaks - importing from server directory
import { appRouter } from '../server/routers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Testing Phase 2E: Server router imports');
    
    res.status(200).json({
      test: 'phase2E',
      message: 'All imports including server router working',
      appRouterLoaded: typeof appRouter === 'object',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Phase 2E failed:', error);
    res.status(500).json({ 
      error: 'Phase 2E failed - likely server import issue',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}