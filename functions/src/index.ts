import "dotenv/config";
import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import express from "express";
import cors from "cors";
import {initTRPC} from "@trpc/server";
import {createExpressMiddleware} from "@trpc/server/adapters/express";
import superjson from "superjson";
import {generateImageRunware} from "./runware";
import {generateVideoReplicate} from "./replicate";
import {generateVideoRunware} from "./runwareVideo";

// Configure Firebase Functions
setGlobalOptions({
  maxInstances: 10,
  timeoutSeconds: 540,
  memory: "2GiB",
});

// Initialize tRPC
const t = initTRPC.create({
  transformer: superjson,
});

// Create tRPC router with basic endpoints
const appRouter = t.router({
  credits: t.router({
    getBalance: t.procedure.query(async () => {
      // Mock credits data
      return {balance: 1000, lastUpdated: new Date()};
    }),
  }),
  payments: t.router({
    getPackages: t.procedure.query(async () => {
      // Mock payment packages
      return [
        {id: "basic", name: "Basic", credits: 100, price: 10},
        {id: "premium", name: "Premium", credits: 500, price: 45},
      ];
    }),
  }),
  generations: t.router({
    generateImage: t.procedure
      .input((input: unknown) => input as {
        prompt: string; 
        model: string;
        aspectRatio: string;
      })
      .mutation(async ({input}) => {
        logger.info("Generate image request", {input});
        
        try {
          // Use actual Runware image generation
          const result = await generateImageRunware({
            prompt: input.prompt,
            model: input.model,
            width: 1024,
            height: 1024,
            steps: 20,
          });

          if (!result.success) {
            throw new Error(result.error || "Image generation failed");
          }

          return {
            success: true,
            imageUrl: result.imageUrl,
            requestId: `img_${Date.now()}`,
          };
        } catch (error) {
          logger.error("Image generation error", {error});
          throw new Error(error instanceof Error ? error.message : "Image generation failed");
        }
      }),
  }),
  video: t.router({
    generate: t.procedure
      .input((input: unknown) => input as {
        prompt: string; 
        model: string;
        imageData?: string;
        duration?: number;
        generateAudio?: boolean;
      })
      .mutation(async ({input}) => {
        logger.info("Generate video request", {input});
        
        try {
          // Choose API based on model
          if (input.model === "runway-ml/runway-gen3-alpha") {
            const result = await generateVideoReplicate({
              prompt: input.prompt,
              model: input.model,
            });

            if (!result.success) {
              throw new Error(result.error || "Video generation failed");
            }

            return {
              success: true,
              videoUrl: result.videoUrl,
              requestId: `vid_${Date.now()}`,
            };
          } else {
            // Use Runware for other models  
            const result = await generateVideoRunware({
              prompt: input.prompt,
              model: input.model as any,
              duration: input.duration || 5,
            });

            if (!result.videoURL) {
              throw new Error("Video generation failed - no video URL returned");
            }

            return {
              success: true,
              videoUrl: result.videoURL,
              requestId: `vid_${Date.now()}`,
            };
          }
        } catch (error) {
          logger.error("Video generation error", {error});
          throw new Error(error instanceof Error ? error.message : "Video generation failed");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Create Express app
const app = express();

// Middleware
app.use(cors({origin: true}));
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));

// Basic health check
app.get("/api/health", (req, res) => {
  logger.info("Health check called");
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Firebase Functions API",
  });
});

// Mock video generation endpoint
app.post("/api/generate-video", (req, res) => {
  logger.info("Video generation request", {body: req.body});
  res.json({
    success: true,
    message: "Video generation endpoint working on Firebase Functions",
    requestId: `req_${Date.now()}`,
    data: req.body,
  });
});

// tRPC API endpoint
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}), // Empty context for now
  })
);

// Mock image generation endpoint
app.post("/api/generate-image", (req, res) => {
  logger.info("Image generation request", {body: req.body});
  res.json({
    success: true,
    message: "Image generation endpoint working on Firebase Functions",
    requestId: `req_${Date.now()}`,
    data: req.body,
  });
});

// Catch all for API routes
app.get("/", (req, res) => {
  res.json({
    message: "Firebase Functions API is running",
    availableEndpoints: [
      "/api/health",
      "/api/generate-video",
      "/api/generate-image",
    ],
  });
});

// Export Firebase Function
export const api = onRequest(app);
