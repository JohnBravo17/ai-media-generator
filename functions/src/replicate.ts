/**
 * Replicate API Integration
 * Handles image and video generation using Replicate's API
 * Note: Nano Banana functionality has been moved to nanoBanana.ts module
 * Note: Seedream functionality has been moved to seedream.ts module
 */

import Replicate from "replicate";
// Import nano-banana functionality from dedicated module
export { 
  generateImageNanoBanana, 
  uploadFileToReplicate, 
  calculateNanoBananaCost,
  NANO_BANANA_INFO 
} from "./nanoBanana";
// Import seedream functionality from dedicated module
export { 
  generateImageSeedream, 
  calculateSeedreamCost, 
  getSeedreamModelInfo 
} from "./seedream";

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

if (!REPLICATE_API_KEY) {
  console.warn("[Replicate] API key not configured");
}

const replicate = new Replicate({
  auth: REPLICATE_API_KEY || "",
});



/**
 * Generate video using Replicate API
 */
export async function generateVideoReplicate(params: {
  prompt: string;
  model?: string;
}): Promise<{
  success: boolean;
  videoUrl?: string;
  cost?: number;
  error?: string;
  processingTime?: number;
}> {
  if (!REPLICATE_API_KEY) {
    return {
      success: false,
      error: "Replicate API key not configured",
    };
  }

  // Default to a video model
  const model = params.model || "stability-ai/stable-video-diffusion";
  
  try {
    const startTime = Date.now();

    const output = await replicate.run(model as any, {
      input: {
        prompt: params.prompt,
      },
    });

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    // Estimate cost for video (varies by model, ~$0.50 per video)
    const estimatedCost = 0.50;

    const videoUrl = Array.isArray(output) ? output[0] : String(output);

    return {
      success: true,
      videoUrl,
      cost: estimatedCost,
      processingTime,
    };
  } catch (error) {
    console.error("[Replicate] Video generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}



/**
 * Calculate cost with 30% markup
 */
export function calculateUserCost(apiCost: number): number {
  return Math.ceil(apiCost * 1.3);
}

