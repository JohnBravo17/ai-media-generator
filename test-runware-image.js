// Test script to debug Runware image-to-video API calls
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock environment
process.env.RUNWARE_API_KEY = "your_api_key_here"; // Replace with your actual API key

// Import the video generation function
import { generateVideoRunware } from './server/runwareVideo.ts';

// Function to convert image to base64 (simulating frontend behavior)
function imageToBase64(imagePath) {
  try {
    const imageBuffer = readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    console.log("📂 Image loaded, size:", imageBuffer.length, "bytes");
    console.log("🔤 Base64 preview:", base64String.substring(0, 50) + '...');
    console.log("🔍 Base64 starts with:", base64String.substring(0, 20));
    return base64String;
  } catch (error) {
    console.error("❌ Failed to load image:", error.message);
    return null;
  }
}

async function testRunwareImageToVideo() {
  console.log("🧪 Testing Runware Image-to-Video API...\n");
  
  // You'll need to provide a test image path
  const testImagePath = join(__dirname, 'test-image.jpg'); // Change this to your test image
  
  console.log("📸 Looking for test image at:", testImagePath);
  
  const imageBase64 = imageToBase64(testImagePath);
  if (!imageBase64) {
    console.log("❌ No test image found. Please:");
    console.log("1. Add a test image (JPG/PNG) to the project root");
    console.log("2. Update the testImagePath in this script");
    console.log("3. Make sure you have a valid RUNWARE_API_KEY");
    return;
  }
  
  const testOptions = {
    model: "veo-3-fast",
    prompt: "A beautiful sunset over mountains, cinematic",
    duration: 8,
    inputImage: imageBase64, // Raw base64 (like frontend sends)
    width: 1280,
    height: 720
  };
  
  try {
    console.log("\n🚀 Calling generateVideoRunware with options:");
    console.log("- Model:", testOptions.model);
    console.log("- Prompt:", testOptions.prompt);
    console.log("- Duration:", testOptions.duration);
    console.log("- Image size:", testOptions.inputImage?.length, "chars");
    console.log("- Dimensions:", `${testOptions.width}x${testOptions.height}`);
    
    const result = await generateVideoRunware(testOptions);
    console.log("\n✅ Success! Result:", result);
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("Runware API error")) {
      console.log("\n🔍 This appears to be a Runware API error.");
      console.log("Check the debug output above for:");
      console.log("- 🖼️ Original image data logs");
      console.log("- 🛠️ Final frameImages structure");
      console.log("- 🔍 Runware request payload");
    }
  }
}

// Run the test
testRunwareImageToVideo().catch(console.error);