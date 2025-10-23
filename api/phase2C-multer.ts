// Phase 2C: Test Multer import
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import type { Request, Response } from "express";
import multer from "multer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Testing Phase 2C: Multer imports');
    
    // Test multer configuration
    const upload = multer({ 
      storage: multer.memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 }
    });
    
    res.status(200).json({
      test: 'phase2C',
      message: 'Express + Multer imports working',
      multerLoaded: typeof multer === 'function',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Phase 2C failed:', error);
    res.status(500).json({ 
      error: 'Phase 2C failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}