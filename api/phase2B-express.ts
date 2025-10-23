// Phase 2B: Test Express import
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import type { Request, Response } from "express";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Testing Phase 2B: Express imports');
    
    // Test creating an Express app
    const app = express();
    
    res.status(200).json({
      test: 'phase2B',
      message: 'Express imports working',
      expressVersion: express.toString().length > 0 ? 'loaded' : 'failed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Phase 2B failed:', error);
    res.status(500).json({ 
      error: 'Phase 2B failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}