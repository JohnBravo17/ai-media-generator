/**
 * Seedream API Integration
 * Handles image generation using ByteDance Seedream-4 model on Replicate
 * This module is separated to protect Seedream functionality when working on other models
 */

import Replicate from "replicate";

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

if (!REPLICATE_API_KEY) {
  throw new Error(
    "⚠️ REPLICATE_API_KEY is required for Seedream functionality"
  );
}

const replicate = new Replicate({
  auth: REPLICATE_API_KEY || "",
});

export interface SeedreamGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  num_outputs?: number;
}

/**
 * Generate image using Seedream-4 model on Replicate
 */
export async function generateImageSeedream(options: SeedreamGenerationOptions) {
  console.log("🎨 Generating image with Seedream-4:", {
    prompt: options.prompt?.substring(0, 50) + "...",
    dimensions: `${options.width || 512}x${options.height || 512}`,
    seed: options.seed,
  });

  try {
    const response = await replicate.run(
      "bytedance/seedream-4" as any,
      {
        input: {
          prompt: options.prompt,
          width: options.width || 512,
          height: options.height || 512,
          seed: options.seed,
          num_outputs: options.num_outputs || 1,
        }
      }
    );

    console.log("✅ Seedream generation successful");
    return { images: response };
  } catch (error) {
    console.error("❌ Seedream generation failed:", error);
    throw new Error(`Seedream API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate cost for Seedream generation
 * ByteDance Seedream-4 pricing estimation
 */
export function calculateSeedreamCost(options: SeedreamGenerationOptions): number {
  // Base cost estimation for Seedream-4 (adjust based on actual pricing)
  const baseCost = 0.03; // Estimated cost per generation
  const numOutputs = options.num_outputs || 1;
  
  // Apply 30% markup
  const totalCost = baseCost * numOutputs * 1.3;
  
  return Math.ceil(totalCost * 100); // Convert to credits (cents)
}

/**
 * Get Seedream model information
 */
export function getSeedreamModelInfo() {
  return {
    name: "Seedream 4.0",
    description: "ByteDance's unified text-to-image generation and precise single-sentence editing at up to 4K resolution",
    provider: "replicate",
    model: "bytedance/seedream-4",
    supportedFeatures: {
      textToImage: true,
      imageToImage: true,
      customDimensions: true,
      seedControl: true,
    },
    maxDimensions: {
      width: 4096,
      height: 4096,
    },
    defaultDimensions: {
      width: 512,
      height: 512,
    },
  };
}