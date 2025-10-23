// Debug new main API directly
import fetch from 'node-fetch';

const BASE_URL = 'https://ai-media-generator-git-main-johnbravo17s-projects.vercel.app';

async function debugNewMainAPI() {
  console.log('🔍 Debug New Main API');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    const response = await fetch(`${BASE_URL}/api/index`);
    const text = await response.text();
    
    console.log('URL tested:', `${BASE_URL}/api/index`);
    console.log('Status:', response.status);
    console.log('Response Text (first 500 chars):');
    console.log(text.substring(0, 500));
    
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Also try direct /api path
  try {
    console.log('\n--- Testing /api directly ---');
    const response = await fetch(`${BASE_URL}/api`);
    const text = await response.text();
    
    console.log('URL tested:', `${BASE_URL}/api`);
    console.log('Status:', response.status);
    console.log('Response Text (first 500 chars):');
    console.log(text.substring(0, 500));
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

debugNewMainAPI().catch(console.error);