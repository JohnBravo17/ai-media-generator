// Debug response content
import fetch from 'node-fetch';

const BASE_URL = 'https://ai-media-generator-git-main-johnbravo17s-projects.vercel.app';

async function debugResponse() {
  console.log('🔍 Debug Response Content');
  
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    const response = await fetch(`${BASE_URL}/api/serverless-native`);
    const text = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response Text:');
    console.log(text);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

debugResponse().catch(console.error);