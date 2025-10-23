// Credits API - /api/trpc/credits.ts
// Handles all credits-related tRPC calls

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
    console.log(`💰 Credits API: ${method} ${url}`);
    
    // Extract procedure from URL path
    // URL could be: /api/trpc/credits or /api/trpc/credits.getBalance
    let procedure = 'getBalance'; // default
    
    if (url.includes('.')) {
      const parts = url.split('.');
      procedure = parts[parts.length - 1];
    } else if (url.includes('/getBalance')) {
      procedure = 'getBalance';
    } else if (url.includes('/getTransactions')) {
      procedure = 'getTransactions';
    }
    
    console.log(`💰 Credits Procedure: ${procedure}`);

    // Handle getBalance
    if (procedure === 'getBalance') {
      return res.status(200).json({
        result: {
          data: {
            balance: 1000 // Mock balance for testing
          }
        }
      });
    }

    // Handle getTransactions
    if (procedure === 'getTransactions') {
      return res.status(200).json({
        result: {
          data: [] // Mock empty transactions
        }
      });
    }

    // Default response
    return res.status(200).json({
      message: 'Credits API',
      availableProcedures: ['getBalance', 'getTransactions'],
      procedure: procedure
    });

  } catch (error) {
    console.error('❌ Credits API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}