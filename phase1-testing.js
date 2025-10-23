// Phase 1: Systematic API Testing
// This will test each level of complexity to find the breaking point

import fetch from 'node-fetch';

const BASE_URL = 'https://ai-media-generator-git-main-johnbravo17s-projects.vercel.app';

async function phase1Testing() {
  console.log('🔬 Phase 1: Systematic API Isolation Testing');
  console.log('='.repeat(60));

  const results = {
    simple: { working: false, error: null },
    minimal: { working: false, error: null },
    mainAPI: { working: false, error: null },
    tRPC: { working: false, error: null }
  };

  // Test 1: Simple API (our basic test endpoint)
  console.log('\n📍 Step 1: Testing Simple API Endpoint');
  console.log('-'.repeat(30));
  try {
    const response = await fetch(`${BASE_URL}/api/test-simple`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Response: ${text.substring(0, 100)}...`);
    
    if (response.status === 200 && text.startsWith('{')) {
      console.log('✅ Simple API: WORKING');
      results.simple.working = true;
    } else {
      console.log('❌ Simple API: FAILED');
      results.simple.error = `Status ${response.status}: ${text.substring(0, 100)}`;
    }
  } catch (error) {
    console.log(`❌ Simple API: ERROR - ${error.message}`);
    results.simple.error = error.message;
  }

  // Test 2: Minimal API (our minimal test with routing)
  console.log('\n📍 Step 2: Testing Minimal API with Routing');
  console.log('-'.repeat(30));
  try {
    const response = await fetch(`${BASE_URL}/api/minimal`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text.substring(0, 100)}...`);
    
    if (response.status === 200 && text.startsWith('{')) {
      console.log('✅ Minimal API: WORKING');
      results.minimal.working = true;
    } else {
      console.log('❌ Minimal API: FAILED');
      results.minimal.error = `Status ${response.status}: ${text.substring(0, 100)}`;
    }
  } catch (error) {
    console.log(`❌ Minimal API: ERROR - ${error.message}`);
    results.minimal.error = error.message;
  }

  // Test 3: Main API (complex Express/tRPC setup)
  console.log('\n📍 Step 3: Testing Main API (Express + Dependencies)');
  console.log('-'.repeat(30));
  try {
    const response = await fetch(`${BASE_URL}/api/index`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text.substring(0, 100)}...`);
    
    if (response.status === 200) {
      console.log('✅ Main API: WORKING');
      results.mainAPI.working = true;
    } else {
      console.log('❌ Main API: FAILED');
      results.mainAPI.error = `Status ${response.status}: ${text.substring(0, 100)}`;
    }
  } catch (error) {
    console.log(`❌ Main API: ERROR - ${error.message}`);
    results.mainAPI.error = error.message;
  }

  // Test 4: tRPC Endpoint (if main API works)
  console.log('\n📍 Step 4: Testing tRPC Integration');
  console.log('-'.repeat(30));
  try {
    const response = await fetch(`${BASE_URL}/api/trpc/credits.getBalance`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text.substring(0, 100)}...`);
    
    if (response.status === 200 && text.startsWith('{')) {
      console.log('✅ tRPC: WORKING');
      results.tRPC.working = true;
    } else {
      console.log('❌ tRPC: FAILED');
      results.tRPC.error = `Status ${response.status}: ${text.substring(0, 100)}`;
    }
  } catch (error) {
    console.log(`❌ tRPC: ERROR - ${error.message}`);
    results.tRPC.error = error.message;
  }

  // Analysis and Next Steps
  console.log('\n' + '='.repeat(60));
  console.log('📊 PHASE 1 ANALYSIS RESULTS');
  console.log('='.repeat(60));
  
  console.log('\n🔍 Component Status:');
  console.log(`Simple API:     ${results.simple.working ? '✅ WORKING' : '❌ BROKEN'}`);
  console.log(`Minimal API:    ${results.minimal.working ? '✅ WORKING' : '❌ BROKEN'}`);
  console.log(`Main API:       ${results.mainAPI.working ? '✅ WORKING' : '❌ BROKEN'}`);
  console.log(`tRPC:           ${results.tRPC.working ? '✅ WORKING' : '❌ BROKEN'}`);

  console.log('\n💡 Diagnosis:');
  if (results.simple.working && !results.mainAPI.working) {
    console.log('🎯 IDENTIFIED: Issue is in MAIN API complexity (Express/tRPC/dependencies)');
    console.log('🔧 Next Step: Isolate specific problematic import/dependency');
  } else if (!results.simple.working) {
    console.log('🚨 CRITICAL: Basic Vercel functions not working - fundamental configuration issue');
    console.log('🔧 Next Step: Fix basic Vercel serverless function setup');
  } else if (results.mainAPI.working && !results.tRPC.working) {
    console.log('🎯 IDENTIFIED: Issue is in tRPC configuration/routing');
    console.log('🔧 Next Step: Debug tRPC router setup');
  } else {
    console.log('🔍 MIXED RESULTS: Need deeper investigation');
  }

  console.log('\n📝 Error Details:');
  Object.entries(results).forEach(([component, result]) => {
    if (result.error) {
      console.log(`${component}: ${result.error}`);
    }
  });

  return results;
}

// Execute Phase 1
phase1Testing()
  .then(results => {
    console.log('\n🏁 Phase 1 Complete - Ready for Phase 2 based on results');
  })
  .catch(error => {
    console.error('❌ Phase 1 Testing Failed:', error);
  });