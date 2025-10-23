// Simple Main API - Just a basic function

export default function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple response
  return res.status(200).json({
    status: 'success',
    message: 'Simple main API working',
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
}