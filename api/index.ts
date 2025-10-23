// AI Media Generator API - Serverless Native
// This version works in Vercel's serverless environment

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-trpc-source');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url, query, body } = req;
  
  try {
    console.log(`🚀 API Call: ${method} ${url}`);

    // Health check
    if (url === '/api' || url === '/api/') {
      return res.status(200).json({
        status: 'success',
        message: 'AI Media Generator API - Serverless',
        timestamp: new Date().toISOString()
      });
    }

    // Parse tRPC-style paths
    const urlParts = url.split('/');
    const trpcIndex = urlParts.indexOf('trpc');
    
    if (trpcIndex === -1) {
      return res.status(404).json({ error: 'tRPC endpoint not found' });
    }

    const procedure = urlParts.slice(trpcIndex + 1).join('.');
    console.log(`🎯 tRPC Procedure: ${procedure}`);

    // Handle credits
    if (procedure === 'credits.getBalance') {
      return res.status(200).json({
        result: {
          data: {
            balance: 1000 // Mock balance
          }
        }
      });
    }

    // Handle image generation
    if (procedure === 'generations.generateImage') {
      console.log('🎨 Image generation request:', body);
      
      const input = body?.input || {};
      const { prompt, model = 'runware', aspectRatio = '1:1' } = input;

      // Mock successful generation
      const mockResult = {
        result: {
          data: {
            success: true,
            imageUrl: 'https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=' + encodeURIComponent(prompt || 'Generated'),
            prompt: prompt || 'test prompt',
            model,
            aspectRatio,
            timestamp: new Date().toISOString()
          }
        }
      };

      return res.status(200).json(mockResult);
    }

    // Handle rate limit
    if (procedure === 'generations.rateLimit') {
      return res.status(200).json({
        result: {
          data: {
            canGenerate: true,
            remainingGenerations: 10
          }
        }
      });
    }

    // Default for unknown procedures
    return res.status(404).json({
      error: 'Procedure not found',
      procedure,
      availableProcedures: [
        'credits.getBalance',
        'generations.generateImage',
        'generations.rateLimit'
      ]
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}