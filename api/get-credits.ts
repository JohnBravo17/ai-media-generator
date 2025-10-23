// Simple Credits API that works
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Always return credits balance in tRPC format
  return res.status(200).json({
    result: {
      data: {
        balance: 1000
      }
    }
  });
}