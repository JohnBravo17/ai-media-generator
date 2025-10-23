// Simple API test - minimal Vercel function
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🚀 Simple API test handler started');
    
    // Basic response
    res.status(200).json({ 
      message: 'Simple API test successful',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in simple API test:', error);
    res.status(500).json({ 
      error: 'Simple API test failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}