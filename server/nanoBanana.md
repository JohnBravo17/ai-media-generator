# Nano Banana Module

**🍌 Dedicated module for Google Gemini 2.5 Flash Image generation**

This module is **STABLE** and protected from modifications when working on other features.

## Overview

The Nano Banana module provides image-to-image generation capabilities using Google's Gemini 2.5 Flash Image model through Replicate's API. It supports both text-to-image and image-to-image generation with advanced features like style transfer and image fusion.

## Features

### ✅ Supported Capabilities
- **Text-to-Image**: Generate images from text prompts only
- **Image-to-Image**: Transform/edit existing images with prompts  
- **Multiple Input Images**: Support for up to 10 reference images
- **Style Transfer**: Apply artistic styles from reference images
- **Image Fusion**: Blend multiple images with AI guidance
- **File Upload**: Direct integration with Replicate's Files API

### ❌ Model Limitations
- **Custom Aspect Ratio**: Model determines output dimensions automatically
- **Custom Output Format**: Model chooses optimal format
- **File Size**: Maximum 100MB per file (Replicate's limit)

## API Reference

### `generateImageNanoBanana(params)`

Generate images using the nano-banana model.

```typescript
const result = await generateImageNanoBanana({
  prompt: "transform this into cyberpunk style",
  imageUrls: ["https://replicate.delivery/..."], // Optional
});
```

**Parameters:**
- `prompt` (string): Text description of desired output
- `imageUrls` (string[], optional): Array of Replicate file URLs for image input
- `aspectRatio` (string, optional): Kept for compatibility but ignored
- `outputFormat` (string, optional): Kept for compatibility but ignored

**Returns:**
```typescript
{
  success: boolean;
  imageUrl?: string;
  cost?: number; // Always 0.039 USD
  error?: string;
  processingTime?: number; // In seconds
}
```

### `uploadFileToReplicate(file)`

Upload files to Replicate for use as image inputs.

```typescript
const result = await uploadFileToReplicate({
  buffer: fileBuffer,
  filename: "image.jpg",
  mimeType: "image/jpeg"
});
```

**Parameters:**
- `buffer` (Buffer): File data as Node.js Buffer
- `filename` (string): Original filename with extension
- `mimeType` (string): MIME type (e.g., "image/jpeg")

**Returns:**
```typescript
{
  success: boolean;
  url?: string; // Replicate file URL for model input
  error?: string;
}
```

### `calculateNanoBananaCost(apiCost)`

Calculate user-facing cost with 30% markup.

```typescript
const userCost = calculateNanoBananaCost(0.039); // Returns 4 cents
```

## Model Information

```typescript
import { NANO_BANANA_INFO } from './nanoBanana';

console.log(NANO_BANANA_INFO);
// {
//   name: "Nano Banana",
//   description: "Google Gemini 2.5 Flash Image - Style transfer & fusion",
//   cost: "~5 credits",
//   apiCost: 0.039,
//   provider: "replicate", 
//   model: "google/nano-banana",
//   supportedFeatures: { ... },
//   limitations: { ... }
// }
```

## Usage Examples

### Text-to-Image Generation
```typescript
const result = await generateImageNanoBanana({
  prompt: "a serene mountain landscape at sunset"
});

if (result.success) {
  console.log("Generated image:", result.imageUrl);
  console.log("Cost: $", result.cost);
}
```

### Image-to-Image with Style Transfer  
```typescript
// First upload reference image
const uploadResult = await uploadFileToReplicate({
  buffer: imageBuffer,
  filename: "reference.jpg", 
  mimeType: "image/jpeg"
});

if (uploadResult.success) {
  // Then generate with reference
  const result = await generateImageNanoBanana({
    prompt: "make this image look like a Van Gogh painting",
    imageUrls: [uploadResult.url]
  });
}
```

### Multiple Image Fusion
```typescript
const imageUrls = [
  "https://replicate.delivery/image1.jpg",
  "https://replicate.delivery/image2.jpg", 
  "https://replicate.delivery/image3.jpg"
];

const result = await generateImageNanoBanana({
  prompt: "blend these images into a surreal dreamscape",
  imageUrls: imageUrls
});
```

## Integration Points

### Express Route (File Upload)
```typescript
// server/_core/index.ts
import { uploadFileToReplicate } from "../nanoBanana";

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const result = await uploadFileToReplicate({
    buffer: req.file.buffer,
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
  });
  res.json(result);
});
```

### tRPC Router
```typescript  
// server/routers.ts
import { generateImageNanoBanana } from "./nanoBanana";

// In generateImage mutation:
if (input.provider === "replicate") {
  result = await generateImageNanoBanana({
    prompt: input.prompt,
    imageUrls: input.imageUrls,
  });
}
```

### Frontend Integration
```typescript
// client/src/pages/Generate.tsx
// File upload handled by /api/upload endpoint
// Image generation via tRPC with imageUrls parameter
```

## Environment Setup

Required environment variable:
```bash
REPLICATE_API_KEY=r_your_api_key_here
```

## Cost Structure

- **API Cost**: $0.039 USD per image generation
- **User Cost**: $0.051 USD (with 30% markup) 
- **Credits**: ~5 credits per generation (depending on credit value)

## Error Handling

The module includes comprehensive error handling:
- Missing API key validation
- File upload failures with detailed messages
- Model generation errors with retry suggestions
- Network timeout handling
- Invalid input validation

## Security Considerations

- File type validation (images only)
- File size limits (100MB max)
- API key protection
- Input sanitization for prompts
- Secure file upload handling

## Testing

Test the module functionality:
```bash
cd ai-media-generator
pnpm dev
# Navigate to http://localhost:3000
# Select "Nano Banana" model
# Upload images and test generation
```

---

**⚠️ Important**: This module should remain stable and unchanged unless specifically working on nano-banana improvements. For other AI models, create separate modules following this pattern.