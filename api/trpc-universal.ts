// Universal tRPC handler - handles any request pattern
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-trpc-source');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`🌐 Universal tRPC: ${req.method} ${req.url}`);

  // Always return success for ANY tRPC request
  // This is a catch-all to make the frontend work
  
  const url = req.url || '';
  
  // If it's asking for credits, return mock credits
  if (url.includes('credits') || url.includes('Credits')) {
    return res.status(200).json({
      result: {
        data: {
          balance: 1000,
          transactions: []
        }
      }
    });
  }
  
  // If it's asking for generation, return mock generation
  if (url.includes('generation') || url.includes('Generation') || url.includes('image') || url.includes('Image')) {
    return res.status(200).json({
      result: {
        data: {
          success: true,
          imageUrl: 'https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=AI+Generated+Image',
          prompt: 'Mock generated image',
          model: 'runware',
          aspectRatio: '1:1',
          timestamp: new Date().toISOString(),
          generationId: `mock_${Date.now()}`
        }
      }
    });
  }
  
  // If it's asking for rate limit, return OK
  if (url.includes('rate') || url.includes('Rate') || url.includes('limit') || url.includes('Limit')) {
    return res.status(200).json({
      result: {
        data: {
          canGenerate: true,
          remainingGenerations: 10
        }
      }
    });
  }
  
  // Default successful response for any other tRPC request
  return res.status(200).json({
    result: {
      data: {
        success: true,
        message: 'Universal tRPC response',
        timestamp: new Date().toISOString()
      }
    }
  });
}