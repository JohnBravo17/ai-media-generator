// Phase 3: Test Lightweight Serverless Solution
import fetch from 'node-fetch';

const BASE_URL = 'https://ai-media-generator-git-main-johnbravo17s-projects.vercel.app';

async function phase3Testing() {
  console.log('🚀 Phase 3: Testing Lightweight Serverless Solution');
  console.log('='.repeat(60));
  
  // Wait for deployment
  console.log('⏳ Waiting for Vercel deployment...\n');
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Test 1: Lightweight tRPC router
  console.log('📍 Step 1: Testing Lightweight tRPC Router');
  console.log('-'.repeat(40));
  try {
    const response = await fetch(`${BASE_URL}/api/phase3A-lightweight/trpc/credits.getBalance`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text.substring(0, 200)}...`);
    
    if (response.status === 200 && text.includes('balance')) {
      console.log('✅ Lightweight tRPC: WORKING');
    } else {
      console.log('❌ Lightweight tRPC: FAILED');
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }

  // Test 2: Working API replacement
  console.log('\n📍 Step 2: Testing Working API Replacement');
  console.log('-'.repeat(40));
  try {
    const response = await fetch(`${BASE_URL}/api/working/trpc/credits.getBalance`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text.substring(0, 200)}...`);
    
    if (response.status === 200 && text.includes('balance')) {
      console.log('✅ Working API: SUCCESS');
    } else {
      console.log('❌ Working API: FAILED');
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }

  // Test 3: Generation endpoint
  console.log('\n📍 Step 3: Testing Image Generation');
  console.log('-'.repeat(40));
  try {
    const response = await fetch(`${BASE_URL}/api/working/trpc/generations.generateImage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "0": {
          prompt: "a beautiful sunset",
          model: "runware"
        }
      })
    });
    
    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text.substring(0, 300)}...`);
    
    if (response.status === 200 && (text.includes('success') || text.includes('imageUrl'))) {
      console.log('✅ Generation: WORKING');
    } else {
      console.log('❌ Generation: FAILED');
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 Phase 3 Results Summary');
  console.log('='.repeat(60));
  
  console.log('\n💡 Next Steps:');
  console.log('1. If lightweight router works: Replace main API with working.ts');
  console.log('2. Add real AI service integration gradually');
  console.log('3. Test full application with new API');
  console.log('4. Verify image generation in browser works');
}

phase3Testing().catch(console.error);