/**
 * Runware Video API Integration
 * Handles video generation using Runware's unified video inference API
 * Supports: Veo 3 Fast, Seedance Pro/Lite, Hailuo 02
 */

import crypto from "crypto";

// Type definitions for Runware video models
export type VideoModel = "veo-3-fast" | "seedance-pro" | "seedance-lite" | "hailuo-02" | "sora-2" | "sora-2-pro";

export interface VideoGenerationOptions {
  prompt: string;
  model: VideoModel;
  duration: number;
  width?: number;
  height?: number;
  inputImage?: string; // Base64 encoded image or URL
  generateAudio?: boolean;
  cameraFixed?: boolean;
  promptOptimizer?: boolean;
  seed?: number;
}

export interface RunwareVideoResponse {
  taskType: string;
  taskUUID: string;
  videoUUID?: string;
  videoURL?: string;
  status?: string;
  cost?: number;
}

interface ResolutionSpec {
  width: number;
  height: number;
  label: string;
  supportedDurations?: number[];
}

interface ModelSpec {
  id: string;
  provider: string;
  name: string;
  description: string;
  durations: number[];
  resolutions: ResolutionSpec[];
  frameRate: number;
  features: string[];
  pricing: Record<string, number>;
}

// Model specifications and validation
const MODEL_SPECS: Record<VideoModel, ModelSpec> = {
  "veo-3-fast": {
    id: "google:3@1",
    provider: "google",
    name: "Google Veo 3 Fast",
    description: "Fast & cost-effective variant of Veo 3 with native audio generation",
    durations: [8], // Veo 3 Fast only supports 8 seconds
    resolutions: [
      { width: 1280, height: 720, label: "720p (16:9)" },
      { width: 720, height: 1280, label: "720p (9:16)" },
      { width: 1920, height: 1080, label: "1080p (16:9)" },
      { width: 1080, height: 1920, label: "1080p (9:16)" },
    ],
    frameRate: 24,
    features: ["audio", "text-to-video", "image-to-video"],
    pricing: {
      withAudio: 1.20,
      withoutAudio: 0.80,
    },
  },
  "seedance-pro": {
    id: "bytedance:2@1",
    provider: "bytedance",
    name: "Seedance 1.0 Pro",
    description: "Professional-grade cinematic storytelling with multi-shot support up to 1080p",
    durations: [5, 10], // Seedance Pro only supports 5 or 10 seconds
    resolutions: [
      { width: 864, height: 480, label: "480p (16:9)" },
      { width: 736, height: 544, label: "544p (4:3)" },
      { width: 640, height: 640, label: "640p (1:1)" },
      { width: 1920, height: 1088, label: "1080p (16:9)" },
      { width: 1664, height: 1248, label: "1248p (4:3)" },
      { width: 1440, height: 1440, label: "1440p (1:1)" },
    ],
    frameRate: 24,
    features: ["camera-control", "text-to-video", "image-to-video", "multi-shot"],
    pricing: {
      "5s": 0.484,
      "10s": 0.968,
    },
  },
  "seedance-lite": {
    id: "bytedance:1@1",
    provider: "bytedance", 
    name: "Seedance 1.0 Lite",
    description: "Cost-effective video generation with multiple resolution options",
    durations: [5, 10], // Seedance Lite only supports 5 or 10 seconds
    resolutions: [
      { width: 864, height: 480, label: "480p (16:9)" },
      { width: 736, height: 544, label: "544p (4:3)" },
      { width: 640, height: 640, label: "640p (1:1)" },
      { width: 1248, height: 704, label: "704p (16:9)" },
      { width: 1120, height: 832, label: "832p (4:3)" },
      { width: 960, height: 960, label: "960p (1:1)" },
    ],
    frameRate: 24,
    features: ["camera-control", "text-to-video", "image-to-video"],
    pricing: {
      "5s": 0.173,
      "10s": 0.346,
    },
  },
  "hailuo-02": {
    id: "minimax:3@1",
    provider: "minimax",
    name: "MiniMax Hailuo 02",
    description: "Advanced physics simulation with professional camera controls",
    durations: [6, 10],
    resolutions: [
      { width: 1366, height: 768, label: "768p (16:9)", supportedDurations: [6, 10] },
      { width: 1920, height: 1080, label: "1080p (16:9)", supportedDurations: [6] },
    ],
    frameRate: 25,
    features: ["physics-simulation", "prompt-optimizer", "text-to-video", "image-to-video"], // Actually DOES support frameImages
    pricing: {
      "768p-6s": 0.336,
      "768p-10s": 0.56,
      "1080p-6s": 0.49,
    },
  },
  "sora-2": {
    id: "openai:3@1",
    provider: "openai",
    name: "OpenAI Sora 2",
    description: "Next-generation video & audio generation model with accurate physics and synchronized dialogue",
    durations: [5, 10, 15, 20],
    resolutions: [
      { width: 1280, height: 720, label: "720p (16:9)" },
      { width: 720, height: 1280, label: "720p (9:16)" },
      { width: 1920, height: 1080, label: "1080p (16:9)" },
      { width: 1080, height: 1920, label: "1080p (9:16)" },
      { width: 1080, height: 1080, label: "1080p (1:1)" },
    ],
    frameRate: 24,
    features: ["audio", "physics-simulation", "text-to-video", "dialogue-sync"],
    pricing: {
      "720p": 2.50,
      "1080p": 3.50,
    },
  },
  "sora-2-pro": {
    id: "openai:3@2",
    provider: "openai",
    name: "OpenAI Sora 2 Pro",
    description: "Higher-quality variant of Sora 2 with extra resolution, refined control, and better consistency",
    durations: [5, 10, 15, 20],
    resolutions: [
      { width: 1280, height: 720, label: "720p (16:9)" },
      { width: 720, height: 1280, label: "720p (9:16)" },
      { width: 1920, height: 1080, label: "1080p (16:9)" },
      { width: 1080, height: 1920, label: "1080p (9:16)" },
      { width: 1080, height: 1080, label: "1080p (1:1)" },
      { width: 3840, height: 2160, label: "4K (16:9)" },
    ],
    frameRate: 24,
    features: ["audio", "physics-simulation", "text-to-video", "dialogue-sync", "4k-resolution"],
    pricing: {
      "720p": 4.00,
      "1080p": 5.50,
      "4k": 8.00,
    },
  },
} as const;

/**
 * Validate video generation parameters against model specifications
 */
function validateVideoParameters(options: VideoGenerationOptions): { valid: boolean; error?: string } {
  const spec = MODEL_SPECS[options.model];
  if (!spec) {
    return { valid: false, error: `Unknown model: ${options.model}` };
  }

  // Check if trying to use image-to-video with unsupported model
  if (options.inputImage && !supportsImageToVideo(options.model)) {
    return { 
      valid: false, 
      error: `Image-to-video not supported for ${spec.name}. Supported models: Veo 3 Fast, Seedance Pro/Lite, Hailuo 02` 
    };
  }

  // Check if trying to use audio generation with unsupported model
  if (options.generateAudio && !supportsAudio(options.model)) {
    return { 
      valid: false, 
      error: `Audio generation not supported for ${spec.name}. Supported models: Veo 3 Fast, Sora 2, Sora 2 Pro` 
    };
  }

  // Check duration
  if (!spec.durations.includes(options.duration)) {
    return { 
      valid: false, 
      error: `Duration ${options.duration}s not supported for ${spec.name}. Supported: ${spec.durations.join(', ')}s` 
    };
  }

  // Check resolution if specified
  if (options.width && options.height) {
    const resolution = spec.resolutions.find(r => r.width === options.width && r.height === options.height);
    if (!resolution) {
      const supported = spec.resolutions.map(r => `${r.width}×${r.height}`).join(', ');
      return { 
        valid: false, 
        error: `Resolution ${options.width}×${options.height} not supported for ${spec.name}. Supported: ${supported}` 
      };
    }

    // Special validation for Hailuo 02
    if (options.model === "hailuo-02" && resolution.supportedDurations) {
      if (!resolution.supportedDurations.includes(options.duration)) {
        return { 
          valid: false, 
          error: `Duration ${options.duration}s not supported for ${resolution.label}. Supported: ${resolution.supportedDurations.join(', ')}s` 
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Calculate cost for video generation
 */
export function calculateVideoGenerationCost(options: VideoGenerationOptions): number {
  // Simplified pricing model: 5 credits per second for all models
  return 5 * options.duration;
}

/**
 * Build Runware API request payload
 */
function buildRunwareRequest(options: VideoGenerationOptions): any {
  const spec = MODEL_SPECS[options.model];
  const taskUUID = crypto.randomUUID();

  const baseRequest = {
    taskType: "videoInference",
    taskUUID,
    model: spec.id,
    positivePrompt: options.prompt,
    duration: options.duration,
    deliveryMethod: "async",
    outputType: "URL",
    outputFormat: "MP4",
    includeCost: true,
    seed: options.seed,
  };

  // Add input image if provided (for image-to-video)
  if (options.inputImage) {
    // Ensure base64 image is formatted as proper data URI
    let imageData = options.inputImage;
    
    console.log("🖼️ Original image data type:", typeof imageData);
    console.log("🖼️ Original image data preview:", typeof imageData === 'string' ? imageData.substring(0, 50) + '...' : imageData);
    
    // Check if it's a UUID v4 (8-4-4-4-12 pattern)
    const uuidv4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (typeof imageData === 'string') {
      // If it's raw base64 without data URI prefix or URL, and not UUID, add the prefix
      if (!imageData.startsWith('data:') && !imageData.startsWith('http') && !uuidv4Pattern.test(imageData)) {
        // Detect image type from base64 header or default to JPEG
        let mimeType = 'image/jpeg';
        if (imageData.startsWith('iVBORw0KGgo')) {
          mimeType = 'image/png';
        } else if (imageData.startsWith('UklGR')) {
          mimeType = 'image/webp';
        }
        imageData = `data:${mimeType};base64,${imageData}`;
        console.log("🖼️ Converted to data URI:", imageData.substring(0, 50) + '...');
      }
    } else {
      console.error("🚨 inputImage is not a string:", imageData);
      throw new Error("inputImage must be a string (base64, data URI, URL, or UUID)");
    }
    
    const frameImages = [
      {
        inputImage: imageData, // Should be a single string, property name is inputImage (singular)
        frame: "first"
      }
    ];
    
    Object.assign(baseRequest, { frameImages });
    
    console.log("🛠️ Final frameImages structure:", JSON.stringify(frameImages, null, 2));
  }

  // Add dimensions if specified
  // Note: ByteDance models don't support width/height when using frameImages
  const isByteEdanceWithImage = spec.provider === "bytedance" && options.inputImage;
  
  if (!isByteEdanceWithImage) {
    if (options.width && options.height) {
      Object.assign(baseRequest, {
        width: options.width,
        height: options.height,
      });
    } else {
      // Use default resolution for each model
      const defaultRes = spec.resolutions[0];
      Object.assign(baseRequest, {
        width: defaultRes.width,
        height: defaultRes.height,
      });
    }
  }

  // Add provider-specific settings
  const providerSettings: any = {};

  if (spec.provider === "google") {
    providerSettings.google = {
      generateAudio: options.generateAudio || false,
    };
  } else if (spec.provider === "bytedance") {
    providerSettings.bytedance = {
      cameraFixed: options.cameraFixed || false,
    };
  } else if (spec.provider === "minimax") {
    providerSettings.minimax = {
      promptOptimizer: options.promptOptimizer || false,
    };
  } else if (spec.provider === "openai") {
    providerSettings.openai = {
      generateAudio: options.generateAudio || false,
    };
  }

  if (Object.keys(providerSettings).length > 0) {
    Object.assign(baseRequest, { providerSettings });
  }

  return baseRequest;
}

/**
 * Generate video using Runware API
 */
export async function generateVideoRunware(options: VideoGenerationOptions): Promise<RunwareVideoResponse> {
  const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;
  
  if (!RUNWARE_API_KEY) {
    throw new Error("⚠️ RUNWARE_API_KEY is required for video generation");
  }

  // Validate parameters
  const validation = validateVideoParameters(options);
  if (!validation.valid) {
    throw new Error(`Invalid parameters: ${validation.error}`);
  }

  console.log("🎬 Generating video with Runware:", {
    model: MODEL_SPECS[options.model].name,
    prompt: options.prompt?.substring(0, 50) + "...",
    duration: `${options.duration}s`,
    dimensions: `${options.width || 'auto'}×${options.height || 'auto'}`,
    options: {
      audio: options.generateAudio,
      cameraFixed: options.cameraFixed,
      promptOptimizer: options.promptOptimizer,
    },
  });

  try {
    const requestPayload = buildRunwareRequest(options);
    console.log("🔍 Runware request payload:", JSON.stringify(requestPayload, null, 2));
    
    const response = await fetch("https://api.runware.ai/v1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUNWARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([requestPayload]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🚨 Runware API error response:", errorText);
      throw new Error(`Runware API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Runware video generation started:", data);

    if (data.errors && data.errors.length > 0) {
      throw new Error(`Runware API error: ${data.errors[0].message}`);
    }

    // Return initial response with task UUID for polling
    return {
      taskType: "videoInference",
      taskUUID: requestPayload.taskUUID,
      status: "processing",
    };
  } catch (error) {
    console.error("❌ Runware video generation failed:", error);
    throw new Error(`Runware video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Poll for video generation result
 */
export async function pollVideoResult(taskUUID: string): Promise<RunwareVideoResponse> {
  const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;
  
  if (!RUNWARE_API_KEY) {
    throw new Error("⚠️ RUNWARE_API_KEY is required");
  }

  try {
    const response = await fetch("https://api.runware.ai/v1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUNWARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        taskType: "getResponse",
        taskUUID,
      }]),
    });

    if (!response.ok) {
      throw new Error(`Runware API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors && data.errors.length > 0) {
      throw new Error(`Runware API error: ${data.errors[0].message}`);
    }

    if (data.data && data.data.length > 0) {
      const result = data.data[0];
      return {
        taskType: result.taskType,
        taskUUID: result.taskUUID,
        videoUUID: result.videoUUID,
        videoURL: result.videoURL,
        status: result.status || (result.videoURL ? "success" : "processing"),
        cost: result.cost,
      };
    }

    return {
      taskType: "videoInference",
      taskUUID,
      status: "processing",
    };
  } catch (error) {
    console.error("❌ Failed to poll video result:", error);
    throw new Error(`Failed to get video result: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get model specifications for frontend
 */
export function getVideoModelSpecs() {
  return MODEL_SPECS;
}

/**
 * Get available models list
 */
export function getAvailableVideoModels(): VideoModel[] {
  return Object.keys(MODEL_SPECS) as VideoModel[];
}

/**
 * Check if a model supports image-to-video generation
 */
export function supportsImageToVideo(model: VideoModel): boolean {
  const spec = MODEL_SPECS[model];
  return spec.features.includes("image-to-video");
}

/**
 * Check if a model supports audio generation
 */
export function supportsAudio(model: VideoModel): boolean {
  const spec = MODEL_SPECS[model];
  return spec.features.includes("audio");
}