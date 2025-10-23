// Phase 2D: Test tRPC imports
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import type { Request, Response } from "express";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Testing Phase 2D: tRPC imports');
    
    res.status(200).json({
      test: 'phase2D',
      message: 'Express + Multer + tRPC imports working',
      trpcLoaded: typeof createExpressMiddleware === 'function',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Phase 2D failed:', error);
    res.status(500).json({ 
      error: 'Phase 2D failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}