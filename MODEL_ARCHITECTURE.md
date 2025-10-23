# AI Media Generator - Module Architecture

## Overview
This document outlines the modular architecture for AI model integrations to ensure separation of concerns and prevent interference between different models.

## Module Structure

### 1. Nano-Banana Module (`server/nanoBanana.ts`)
- **Purpose**: Google's nano-banana image editing model
- **Features**: 
  - File upload to Replicate
  - Image generation with nano-banana
  - Cost calculation
  - Model information
- **Provider**: Replicate API
- **Status**: ✅ Protected & Stable

### 2. Seedream Module (`server/seedream.ts`)
- **Purpose**: ByteDance Seedream-4 image generation
- **Features**:
  - Text-to-image generation up to 4K resolution
  - Seed control for reproducible outputs
  - Custom dimensions support
  - Cost calculation with 30% markup
- **Provider**: Replicate API (`bytedance/seedream-4`)
- **Status**: ✅ Protected & Stable

### 3. Runware Module (`server/runware.ts`)
- **Purpose**: FLUX models (schnell, dev)
- **Features**:
  - High-speed image generation
  - Multiple FLUX variants
  - Cost calculation
- **Provider**: Runware API
- **Status**: ✅ Active

### 4. Replicate Module (`server/replicate.ts`)
- **Purpose**: Central Replicate API coordination
- **Features**:
  - Video generation
  - Re-exports from specialized modules
  - Common utilities
- **Provider**: Replicate API
- **Status**: ✅ Coordination Hub

## Module Benefits

### ✅ Separation of Concerns
- Each model has its own dedicated module
- Changes to one model don't affect others
- Clean, maintainable codebase

### ✅ Protected Functionality
- Nano-banana functionality is isolated and protected
- Seedream functionality is isolated and protected
- Future model additions won't break existing features

### ✅ Consistent Architecture
- Standardized function naming: `generateImage{ModelName}`
- Standardized cost calculation: `calculate{ModelName}Cost`
- Standardized model info: `get{ModelName}ModelInfo`

### ✅ Easy Maintenance
- Bug fixes are isolated to specific modules
- Testing is more focused and reliable
- New features can be added without risk

## Usage in Router

```typescript
// Import specific model functions
import { generateImageNanoBanana, calculateNanoBananaCost } from "./nanoBanana";
import { generateImageSeedream, calculateSeedreamCost } from "./seedream";
import { generateImageRunware, calculateUserCost as calculateRunwareCost } from "./runware";

// Route to appropriate module based on model
if (input.model === "nano-banana") {
  result = await generateImageNanoBanana(options);
} else if (input.model === "seedream") {
  result = await generateImageSeedream(options);
} else if (input.model.startsWith("flux-")) {
  result = await generateImageRunware(options);
}
```

## Adding New Models

To add a new model:

1. Create `server/{modelName}.ts` module
2. Implement required functions:
   - `generateImage{ModelName}(options)`
   - `calculate{ModelName}Cost(options)`
   - `get{ModelName}ModelInfo()`
3. Add import to `server/routers.ts`
4. Add routing logic for the new model
5. Update frontend model list if needed

This architecture ensures that existing models remain stable while allowing safe expansion of the AI media generator capabilities.