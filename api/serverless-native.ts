// Serverless-Native API - No server imports
// This API replicates tRPC functionality without importing from /server

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url, query, body } = req;
  
  try {
    // Parse URL to extract tRPC-style paths
    const urlParts = url.split('/');
    const procedure = urlParts[urlParts.length - 1];
    
    console.log(`📡 Serverless API Call: ${method} ${url}`);
    console.log(`🎯 Procedure: ${procedure}`);

    // Handle different procedures
    if (procedure === 'credits.getBalance') {
      // Mock credits balance
      const result = {
        result: {
          data: {
            balance: 1000 // Mock balance
          }
        }
      };
      return res.status(200).json(result);
    }
    
    if (procedure === 'generations.generateImage') {
      // Mock image generation
      console.log('🎨 Mock Image Generation Request');
      
      const result = {
        result: {
          data: {
            success: true,
            imageUrl: 'https://via.placeholder.com/512x512?text=Mock+Generated+Image',
            prompt: body?.input?.prompt || 'mock prompt',
            model: 'mock-runware',
            aspectRatio: '1:1',
            timestamp: new Date().toISOString()
          }
        }
      };
      
      return res.status(200).json(result);
    }

    // Default response for unknown procedures
    return res.status(200).json({
      message: 'Serverless API working!',
      procedure,
      timestamp: new Date().toISOString(),
      availableProcedures: [
        'credits.getBalance',
        'generations.generateImage'
      ]
    });

  } catch (error) {
    console.error('❌ Serverless API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}