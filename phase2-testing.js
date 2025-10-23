// Phase 2: Progressive Import Analysis
import fetch from 'node-fetch';

const BASE_URL = 'https://ai-media-generator-git-main-johnbravo17s-projects.vercel.app';

async function phase2Testing() {
  console.log('🔬 Phase 2: Progressive Import Analysis');
  console.log('='.repeat(60));
  
  // Wait for deployment
  console.log('⏳ Waiting for Vercel deployment...\n');
  await new Promise(resolve => setTimeout(resolve, 15000));

  const tests = [
    { name: 'Phase 2A - Basic imports', endpoint: '/api/phase2A-basic', expected: 'Basic imports working' },
    { name: 'Phase 2B - Express', endpoint: '/api/phase2B-express', expected: 'Express imports working' },
    { name: 'Phase 2C - Multer', endpoint: '/api/phase2C-multer', expected: 'Express + Multer imports working' },
    { name: 'Phase 2D - tRPC', endpoint: '/api/phase2D-trpc', expected: 'Express + Multer + tRPC imports working' },
    { name: 'Phase 2E - Server Router', endpoint: '/api/phase2E-server', expected: 'All imports including server router working' }
  ];

  let lastWorking = null;
  let firstBroken = null;

  for (const test of tests) {
    console.log(`📍 Testing: ${test.name}`);
    console.log('-'.repeat(40));
    
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`);
      const text = await response.text();
      
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${text.substring(0, 150)}...`);
      
      if (response.status === 200 && text.includes(test.expected)) {
        console.log('✅ WORKING');
        lastWorking = test.name;
      } else if (response.status === 500 && text.includes('FUNCTION_INVOCATION_FAILED')) {
        console.log('❌ FUNCTION_INVOCATION_FAILED');
        if (!firstBroken) firstBroken = test.name;
      } else {
        console.log('⚠️  UNEXPECTED RESPONSE');
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      if (!firstBroken) firstBroken = test.name;
    }
    
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('📊 PHASE 2 ANALYSIS RESULTS');
  console.log('='.repeat(60));
  
  console.log(`🟢 Last Working: ${lastWorking || 'None'}`);
  console.log(`🔴 First Broken: ${firstBroken || 'None'}`);
  
  console.log('\n💡 Diagnosis:');
  if (lastWorking && firstBroken) {
    console.log(`🎯 BREAKING POINT IDENTIFIED: Issue occurs between ${lastWorking} and ${firstBroken}`);
    
    if (firstBroken.includes('Server')) {
      console.log('🔧 LIKELY CAUSE: Server imports (routers, context, or dependencies)');
      console.log('🚨 ACTION: Check server/routers.ts and server/_core/ imports');
    } else if (firstBroken.includes('tRPC')) {
      console.log('🔧 LIKELY CAUSE: tRPC dependency incompatibility with serverless');
    } else if (firstBroken.includes('Express')) {
      console.log('🔧 LIKELY CAUSE: Express setup incompatible with Vercel serverless');
    }
  } else if (!lastWorking) {
    console.log('🚨 CRITICAL: Even basic imports fail - fundamental issue');
  } else {
    console.log('✅ ALL IMPORTS WORK: Issue must be in runtime execution, not imports');
  }

  console.log('\n🔄 Next Phase: Based on results, fix the identified breaking component');
}

phase2Testing().catch(console.error);