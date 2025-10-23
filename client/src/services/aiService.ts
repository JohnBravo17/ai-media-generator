// AI Service Configuration - Long-term scalable approach
// This replaces the tRPC client with a more flexible AI service client

interface AIModel {
  id: string;
  name: string;
  provider: string;
  maxResolution: string;
  supportedStyles: string[];
}

interface GenerationOptions {
  prompt: string;
  model: string;
  aspectRatio?: string;
  style?: string;
  quality?: string;
}

class AIService {
  private baseUrl = '/api/ai';

  // Get available models
  async getModels(): Promise<AIModel[]> {
    const response = await fetch(`${this.baseUrl}/models`);
    const data = await response.json();
    return data.result.data.models;
  }

  // Generate image
  async generateImage(options: GenerationOptions) {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ input: options })
    });
    
    const data = await response.json();
    return data.result.data;
  }

  // Check generation status
  async getGenerationStatus(generationId: string) {
    const response = await fetch(`${this.baseUrl}/status?id=${generationId}`);
    const data = await response.json();
    return data.result.data;
  }

  // Get credits
  async getCredits() {
    const response = await fetch(`${this.baseUrl}/credits`);
    const data = await response.json();
    return data.result.data;
  }

  // Batch generate (future feature)
  async batchGenerate(requests: GenerationOptions[]) {
    const response = await fetch(`${this.baseUrl}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ inputs: requests })
    });
    
    const data = await response.json();
    return data.result.data;
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types for TypeScript support
export type { AIModel, GenerationOptions };