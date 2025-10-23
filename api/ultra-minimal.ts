// Ultra-minimal test API - no imports from our server code
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'nodejs',
};

export default function handler(req: NextRequest, res: NextResponse) {
  // Simple test response
  const testData = {
    status: 'success',
    message: 'Ultra-minimal API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
  };

  return NextResponse.json(testData, { status: 200 });
}