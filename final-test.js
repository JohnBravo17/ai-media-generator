// FINAL TEST: Main API with Serverless-Native Implementation
import fetch from 'node-fetch';

const BASE_URL = 'https://ai-media-generator-git-main-johnbravo17s-projects.vercel.app';

async function finalTest() {
  console.log('🎯 FINAL TEST: Serverless-Native Main API');
  console.log('='.repeat(60));
  
  // Wait for deployment
  console.log('⏳ Waiting for deployment...\n');
  await new Promise(resolve => setTimeout(resolve, 20000));

  let allPassed = true;

  // Test 1: Health Check
  console.log('📍 Test 1: API Health Check');
  console.log('-'.repeat(40));
  try {
    const response = await fetch(`${BASE_URL}/api`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    if (response.status === 200) {
      console.log('✅ HEALTH CHECK: PASSED');
    } else {
      console.log('❌ HEALTH CHECK: FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ HEALTH CHECK ERROR: ${error.message}`);
    allPassed = false;
  }

  // Test 2: Credits Balance (The endpoint that was failing!)
  console.log('\n📍 Test 2: Credits Balance (Previously Failing)');
  console.log('-'.repeat(40));
  try {
    const response = await fetch(`${BASE_URL}/api/trpc/credits.getBalance`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    if (response.status === 200 && data.result?.data?.balance) {
      console.log('✅ CREDITS: PASSED - No more JSON parsing errors!');
    } else {
      console.log('❌ CREDITS: FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ CREDITS ERROR: ${error.message}`);
    allPassed = false;
  }

  // Test 3: Image Generation (The main feature!)
  console.log('\n📍 Test 3: Image Generation (Main Feature)');
  console.log('-'.repeat(40));
  try {
    const response = await fetch(`${BASE_URL}/api/trpc/generations.generateImage`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-trpc-source': 'react-query'
      },
      body: JSON.stringify({
        input: {
          prompt: 'A stunning mountain landscape at golden hour',
          model: 'runware',
          aspectRatio: '16:9'
        }
      })
    });
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    if (response.status === 200 && data.result?.data?.success) {
      console.log('✅ IMAGE GENERATION: PASSED - Mock generation working!');
    } else {
      console.log('❌ IMAGE GENERATION: FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ IMAGE GENERATION ERROR: ${error.message}`);
    allPassed = false;
  }

  // Test 4: Rate Limit
  console.log('\n📍 Test 4: Rate Limit Check');
  console.log('-'.repeat(40));
  try {
    const response = await fetch(`${BASE_URL}/api/trpc/generations.rateLimit`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    if (response.status === 200 && data.result?.data?.canGenerate !== undefined) {
      console.log('✅ RATE LIMIT: PASSED');
    } else {
      console.log('❌ RATE LIMIT: FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ RATE LIMIT ERROR: ${error.message}`);
    allPassed = false;
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FINAL RESULTS:');
  console.log('='.repeat(60));
  
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('🎉 The serverless-native API is working perfectly!');
    console.log('🚀 No more FUNCTION_INVOCATION_FAILED errors!');
    console.log('📸 No more JSON parsing errors!');
    console.log('');
    console.log('🔧 SOLUTION SUMMARY:');
    console.log('   - Removed heavy /server imports that crashed in serverless');
    console.log('   - Built serverless-native API with mock responses');
    console.log('   - Replicated tRPC API structure without dependencies');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('   1. ✅ API is functional - users can access app');
    console.log('   2. 🔄 Add real AI service calls (Runware/Replicate)');
    console.log('   3. 💾 Add real database integration');
    console.log('   4. 🎨 Test image generation in browser');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('🔍 Need to debug remaining issues');
  }
}

finalTest().catch(console.error);