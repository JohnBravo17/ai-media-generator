// Simplified API test with minimal imports
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🚀 Minimal API handler started');
    
    // Test basic functionality
    if (req.url === '/api/health') {
      return res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
      });
    }
    
    // Test environment variables
    if (req.url === '/api/env-test') {
      return res.status(200).json({
        hasRunwareKey: !!process.env.RUNWARE_API_KEY,
        hasReplicateKey: !!process.env.REPLICATE_API_KEY,
        nodeEnv: process.env.NODE_ENV || 'unknown'
      });
    }
    
    // Default response
    res.status(200).json({
      message: 'Minimal API working',
      availableEndpoints: ['/api/health', '/api/env-test']
    });
    
  } catch (error) {
    console.error('❌ Error in minimal API:', error);
    res.status(500).json({ 
      error: 'Minimal API failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}