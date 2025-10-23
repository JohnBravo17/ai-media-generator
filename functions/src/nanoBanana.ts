/**
 * Nano Banana (Google Gemini 2.5 Flash Image) Module
 * Dedicated module for nano-banana image generation and file upload functionality
 * This module is stable and should not be modified unless specifically for nano-banana improvements
 */

import Replicate from "replicate";

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

if (!REPLICATE_API_KEY) {
  console.warn("[Nano Banana] API key not configured");
}

const replicate = new Replicate({
  auth: REPLICATE_API_KEY || "",
});

/**
 * Upload file to Replicate using Files API
 * Returns a Replicate file URL that can be used as input for models
 */
export async function uploadFileToReplicate(file: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  if (!REPLICATE_API_KEY) {
    return {
      success: false,
      error: "Replicate API key not configured",
    };
  }

  try {
    console.log("[Nano Banana] Uploading file:", { 
      filename: file.filename, 
      size: file.buffer.length, 
      mimeType: file.mimeType 
    });

    // For files ≤256KB, we could use data URLs, but Replicate's Node.js client
    // handles file uploads automatically, so we'll use the File object approach
    
    // Create a File-like object that the Replicate client can handle
    const fileObject = new File([new Uint8Array(file.buffer)], file.filename, {
      type: file.mimeType,
    });

    // Upload the file using Replicate's files.create method
    const replicateFile = await replicate.files.create(fileObject);

    console.log("[Nano Banana] File uploaded successfully:", {
      id: replicateFile.id,
      name: replicateFile.name,
      size: replicateFile.size,
      contentType: replicateFile.content_type,
      url: replicateFile.urls?.get,
    });

    return {
      success: true,
      url: replicateFile.urls?.get,
    };
  } catch (error) {
    console.error("[Nano Banana] File upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Generate/edit image using Nano Banana (Google Gemini 2.5 Flash Image)
 * Supports multiple input images for style transfer and fusion
 */
export async function generateImageNanoBanana(params: {
  prompt: string;
  imageUrls?: string[]; // Array of image URLs for reference/editing
  aspectRatio?: string; // Keep for compatibility but won't be used
  outputFormat?: string; // Keep for compatibility but won't be used
}): Promise<{
  success: boolean;
  imageUrl?: string;
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

  try {
    const startTime = Date.now();

    // Based on official Replicate docs - only prompt and image_input are supported
    const input: any = {
      prompt: params.prompt,
    };

    // Add image_input array if images are provided
    if (params.imageUrls && params.imageUrls.length > 0) {
      input.image_input = params.imageUrls;
    }

    console.log("[Nano Banana] Generation input:", JSON.stringify(input, null, 2));

    const output = await replicate.run("google/nano-banana", { input });

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    // Nano Banana cost: $0.039 per output image
    const cost = 0.039;

    // Based on official docs: output has a .url() method
    let imageUrl: string;
    if (output && typeof output === 'object' && 'url' in output && typeof output.url === 'function') {
      imageUrl = output.url();
    } else {
      // Fallback if structure is different
      imageUrl = String(output);
    }

    console.log("[Nano Banana] Generation success:", { imageUrl, cost, processingTime });

    return {
      success: true,
      imageUrl,
      cost,
      processingTime,
    };
  } catch (error) {
    console.error("[Nano Banana] Generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculate cost with 30% markup for nano-banana
 */
export function calculateNanoBananaCost(apiCost: number): number {
  return Math.ceil(apiCost * 1.3);
}

/**
 * Nano Banana model information
 */
export const NANO_BANANA_INFO = {
  name: "Nano Banana",
  description: "Google Gemini 2.5 Flash Image - Style transfer & fusion",
  cost: "~5 credits",
  apiCost: 0.039, // $0.039 per image
  provider: "replicate",
  model: "google/nano-banana",
  supportedFeatures: {
    textToImage: true,
    imageToImage: true,
    multipleInputImages: true,
    styleTransfer: true,
    imageFusion: true,
  },
  limitations: {
    // Based on official Replicate docs
    customAspectRatio: false, // Model determines aspect ratio automatically
    customOutputFormat: false, // Model determines format automatically
    maxInputImages: 10, // Reasonable limit for multiple images
    maxFileSize: 100 * 1024 * 1024, // 100MB per Replicate's limit
  }
};