/**
 * Runware API Integration
 * Handles image and video generation using Runware's API
 */

interface RunwareTaskBase {
  taskType: string;
  taskUUID: string;
  includeCost?: boolean;
}

interface ImageInferenceTask extends RunwareTaskBase {
  taskType: "imageInference";
  positivePrompt: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  steps?: number;
  outputFormat?: string;
}

interface RunwareResponse {
  data?: Array<{
    taskType: string;
    taskUUID: string;
    imageURL?: string;
    imageUUID?: string;
    cost?: number;
  }>;
  errors?: Array<{
    taskUUID: string;
    error: string;
  }>;
}

const RUNWARE_API_URL = "https://api.runware.ai/v1";
const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;

if (!RUNWARE_API_KEY) {
  console.warn("[Runware] API key not configured");
}

/**
 * Generate image using Runware API
 */
export async function generateImageRunware(params: {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
}): Promise<{
  success: boolean;
  imageUrl?: string;
  cost?: number;
  error?: string;
  processingTime?: number;
}> {
  if (!RUNWARE_API_KEY) {
    return {
      success: false,
      error: "Runware API key not configured",
    };
  }

  const taskUUID = crypto.randomUUID();
  
  const task: ImageInferenceTask = {
    taskType: "imageInference",
    taskUUID,
    positivePrompt: params.prompt,
    model: params.model || "civitai:102438@133677", // Default working model
    width: params.width || 1024,
    height: params.height || 1024,
    steps: params.steps || 4,
    numberResults: 1,
    outputFormat: "WEBP",
    includeCost: true,
  };

  try {
    const response = await fetch(RUNWARE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RUNWARE_API_KEY}`,
      },
      body: JSON.stringify([task]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Runware] API error:", response.status, errorText);
      return {
        success: false,
        error: `Runware API error: ${response.status}`,
      };
    }

    const result: RunwareResponse = await response.json();

    if (result.errors && result.errors.length > 0) {
      return {
        success: false,
        error: result.errors[0].error,
      };
    }

    if (result.data && result.data.length > 0) {
      const imageData = result.data[0];
      return {
        success: true,
        imageUrl: imageData.imageURL,
        cost: imageData.cost || 0,
      };
    }

    return {
      success: false,
      error: "No image generated",
    };
  } catch (error) {
    console.error("[Runware] Generation error:", error);
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

