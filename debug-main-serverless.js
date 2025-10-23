// Debug the main-serverless API
import fetch from 'node-fetch';

const BASE_URL = 'https://ai-media-generator-git-main-johnbravo17s-projects.vercel.app';

async function debugMainServerless() {
  console.log('🔍 Debug Main Serverless API');
  
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    const response = await fetch(`${BASE_URL}/api/main-serverless`);
    const text = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response Text:');
    console.log(text);
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

debugMainServerless().catch(console.error);