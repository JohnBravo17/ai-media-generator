// Debug tRPC requests - logs everything
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-trpc-source');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('='.repeat(50));
  console.log('🔍 tRPC DEBUG REQUEST');
  console.log('='.repeat(50));
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  console.log('='.repeat(50));

  // Return the same info in response for debugging
  return res.status(200).json({
    debug: 'tRPC Request Logger',
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
}