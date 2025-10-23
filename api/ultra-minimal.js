// Ultra-minimal test API - standard Node.js only

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple test response
  const testData = {
    status: 'success',
    message: 'Ultra-minimal API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
  };

  res.status(200).json(testData);
}