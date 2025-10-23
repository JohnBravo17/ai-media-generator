// Lightweight tRPC Router for Serverless
// This is a minimal version that works without heavy dependencies

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../server/_core/trpc";

// Simple credit router for testing
const creditsRouter = router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    // TESTING MODE: Return mock credits without database
    console.log("🚧 Serverless Mode: Returning mock credit balance");
    return {
      balance: 1000, // Mock balance for testing
    };
  }),
  
  getTransactions: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      // TESTING MODE: Return empty transactions without database
      console.log("🚧 Serverless Mode: Returning empty transactions");
      return [];
    }),
});

// Simple generation router for testing
const generationsRouter = router({
  rateLimit: protectedProcedure.query(async ({ ctx }) => {
    // Mock rate limit check
    return {
      canGenerate: true,
      remainingGenerations: 10,
    };
  }),

  generateImage: protectedProcedure
    .input(z.object({
      prompt: z.string(),
      model: z.string().optional().default("runware"),
      aspectRatio: z.string().optional().default("1:1"),
    }))
    .mutation(async ({ input, ctx }) => {
      console.log("🎨 Serverless Image Generation Request:", input);
      
      try {
        // For now, return a mock successful response
        // TODO: Integrate lightweight AI service calls
        
        const mockResult = {
          success: true,
          imageUrl: "https://example.com/mock-generated-image.jpg",
          generationId: `gen_${Date.now()}`,
          prompt: input.prompt,
          model: input.model,
          timestamp: new Date().toISOString(),
        };
        
        console.log("✅ Mock generation successful:", mockResult);
        return mockResult;
        
      } catch (error) {
        console.error("❌ Generation error:", error);
        throw new Error(
          error instanceof Error ? error.message : "Image generation failed"
        );
      }
    }),
});

// Main app router with minimal functionality
export const appRouter = router({
  credits: creditsRouter,
  generations: generationsRouter,
});

export type AppRouter = typeof appRouter;