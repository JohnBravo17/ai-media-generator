/**
 * Test script for Replicate API - Nano Banana
 * Run this to test if our Replicate integration is working
 */

import "dotenv/config";
import { generateImageNanoBanana } from "./replicate.js";

async function testNanoBanana() {
  console.log("🧪 Testing Nano Banana API...");
  
  const result = await generateImageNanoBanana({
    prompt: "A beautiful sunset over mountains",
  });

  if (result.success) {
    console.log("✅ Success!");
    console.log("📸 Image URL:", result.imageUrl);
    console.log("💰 Cost:", result.cost);
    console.log("⏱️ Processing Time:", result.processingTime, "seconds");
  } else {
    console.log("❌ Failed!");
    console.log("🚨 Error:", result.error);
  }
}

// Run the test
testNanoBanana().catch(console.error);