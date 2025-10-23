// tRPC Serverless API - Direct endpoint
// This replaces the broken /api/trpc routing

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
    console.log(`🎯 tRPC Call: ${method} ${url}`);
    console.log(`📝 Query:`, query);
    console.log(`📦 Body:`, body);

    // Parse tRPC procedure from URL
    // URL format: /api/trpc/credits.getBalance or /api/trpc/generations.generateImage
    const urlParts = url.split('/');
    const trpcIndex = urlParts.indexOf('trpc');
    
    if (trpcIndex === -1 || !urlParts[trpcIndex + 1]) {
      return res.status(200).json({
        message: 'tRPC API Endpoint',
        availableProcedures: [
          'credits.getBalance',
          'credits.getTransactions', 
          'generations.generateImage',
          'generations.rateLimit'
        ]
      });
    }

    const procedure = urlParts.slice(trpcIndex + 1).join('.');
    console.log(`🎯 Procedure: ${procedure}`);

    // Handle Credits
    if (procedure === 'credits.getBalance') {
      return res.status(200).json({
        result: {
          data: {
            balance: 1000 // Mock balance
          }
        }
      });
    }

    if (procedure === 'credits.getTransactions') {
      return res.status(200).json({
        result: {
          data: [] // Mock empty transactions
        }
      });
    }

    // Handle Generations
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

    if (procedure === 'generations.generateImage') {
      console.log('🎨 Image Generation Request');
      
      // Extract input (tRPC format)
      let input = {};
      if (method === 'POST' && body) {
        input = body.input || body;
      } else if (query.input) {
        try {
          input = JSON.parse(query.input).json || {};
        } catch (e) {
          input = {};
        }
      }

      const { prompt, model = 'runware', aspectRatio = '1:1' } = input;
      
      console.log('🖼️ Generation params:', { prompt, model, aspectRatio });

      // Mock successful generation
      const result = {
        result: {
          data: {
            success: true,
            imageUrl: `https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=${encodeURIComponent(prompt || 'AI Generated Image')}`,
            prompt: prompt || 'test prompt',
            model,
            aspectRatio,
            timestamp: new Date().toISOString(),
            generationId: `mock_${Date.now()}`,
            credits: 1
          }
        }
      };

      return res.status(200).json(result);
    }

    // Unknown procedure
    return res.status(404).json({
      error: 'Procedure not found',
      procedure,
      availableProcedures: [
        'credits.getBalance',
        'credits.getTransactions',
        'generations.generateImage', 
        'generations.rateLimit'
      ]
    });

  } catch (error) {
    console.error('❌ tRPC API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}