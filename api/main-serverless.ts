// Main API - Serverless Native Implementation
// This replaces /api/index.ts with a serverless-compatible version

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
    console.log(`🚀 Main API Call: ${method} ${url}`);

    // Health check
    if (url === '/api' || url === '/api/') {
      return res.status(200).json({
        status: 'success',
        message: 'AI Media Generator API - Serverless Native',
        version: '2.0.0-serverless',
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

    // Route to different handlers based on procedure
    if (procedure.startsWith('credits.')) {
      return handleCredits(procedure, req, res);
    }
    
    if (procedure.startsWith('generations.')) {
      return handleGenerations(procedure, req, res, body);
    }

    if (procedure.startsWith('system.')) {
      return handleSystem(procedure, req, res);
    }

    // Default response
    return res.status(404).json({
      error: 'Procedure not found',
      procedure,
      availableProcedures: [
        'credits.getBalance',
        'credits.getTransactions',
        'generations.generateImage',
        'generations.rateLimit',
        'system.getStatus'
      ]
    });

  } catch (error) {
    console.error('❌ Main API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Credits handler
function handleCredits(procedure: string, req: any, res: any) {
  console.log('💰 Handling credits procedure:', procedure);
  
  if (procedure === 'credits.getBalance') {
    return res.status(200).json({
      result: {
        data: {
          balance: 1000 // Mock balance - TODO: Connect to real credit system
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

  return res.status(404).json({ error: 'Credits procedure not found' });
}

// Generations handler
async function handleGenerations(procedure: string, req: any, res: any, body: any) {
  console.log('🎨 Handling generations procedure:', procedure);
  
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
    console.log('🖼️ Image generation request:', body);
    
    // Extract input from tRPC format
    const input = body?.input || {};
    const { prompt, model = 'runware', aspectRatio = '1:1' } = input;

    // TODO: Add real AI service integration here
    // For now, return a mock successful response
    
    const mockResult = {
      result: {
        data: {
          success: true,
          imageUrl: 'https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=' + encodeURIComponent(prompt || 'Generated Image'),
          prompt: prompt || 'mock prompt',
          model,
          aspectRatio,
          timestamp: new Date().toISOString(),
          metadata: {
            generationId: `mock_${Date.now()}`,
            processingTime: '2.3s',
            credits: 1
          }
        }
      }
    };

    return res.status(200).json(mockResult);
  }

  return res.status(404).json({ error: 'Generations procedure not found' });
}

// System handler
function handleSystem(procedure: string, req: any, res: any) {
  console.log('⚙️ Handling system procedure:', procedure);
  
  if (procedure === 'system.getStatus') {
    return res.status(200).json({
      result: {
        data: {
          status: 'operational',
          version: '2.0.0-serverless',
          environment: 'production',
          services: {
            api: 'operational',
            ai: 'operational', // Mock status
            database: 'operational' // Mock status
          }
        }
      }
    });
  }

  return res.status(404).json({ error: 'System procedure not found' });
}