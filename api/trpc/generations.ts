// Generations API - /api/trpc/generations.ts  
// Handles all image generation related tRPC calls

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
    console.log(`🎨 Generations API: ${method} ${url}`);
    
    // Extract procedure from URL
    let procedure = 'generateImage'; // default
    
    if (url.includes('.')) {
      const parts = url.split('.');
      procedure = parts[parts.length - 1];
    } else if (url.includes('/rateLimit')) {
      procedure = 'rateLimit';
    } else if (url.includes('/generateImage')) {
      procedure = 'generateImage';
    }
    
    console.log(`🎨 Generations Procedure: ${procedure}`);

    // Handle rateLimit
    if (procedure === 'rateLimit') {
      return res.status(200).json({
        result: {
          data: {
            canGenerate: true,
            remainingGenerations: 10
          }
        }
      });
    }

    // Handle generateImage
    if (procedure === 'generateImage') {
      console.log('🖼️ Image generation request');
      
      // Extract input from request
      let input: any = {};
      if (method === 'POST' && body) {
        input = body.input || body;
      } else if (query.input) {
        try {
          const parsed = JSON.parse(query.input);
          input = parsed.json || parsed;
        } catch (e) {
          input = {};
        }
      }

      const { prompt = 'test prompt', model = 'runware', aspectRatio = '1:1' } = input;
      
      console.log('🎨 Generation params:', { prompt, model, aspectRatio });

      // Mock successful generation  
      const result = {
        result: {
          data: {
            success: true,
            imageUrl: `https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=${encodeURIComponent(prompt)}`,
            prompt,
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

    // Default response
    return res.status(200).json({
      message: 'Generations API',
      availableProcedures: ['generateImage', 'rateLimit'],
      procedure: procedure
    });

  } catch (error) {
    console.error('❌ Generations API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',  
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}