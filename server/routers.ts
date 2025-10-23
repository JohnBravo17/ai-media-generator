import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getUserCredits,
  initializeUserCredits,
  getUserTransactions,
  getUserGenerations,
  createGeneration,
  updateGeneration,
  deductCredits,
  addCredits,
} from "./dbHelpers";
import { generateImageRunware, calculateUserCost as calculateRunwareCost } from "./runware";
import { generateVideoReplicate, calculateUserCost as calculateReplicateCost } from "./replicate";
import { generateImageNanoBanana, calculateNanoBananaCost } from "./nanoBanana";
import { generateImageSeedream, calculateSeedreamCost } from "./seedream";
import { 
  generateVideoRunware, 
  pollVideoResult, 
  calculateVideoGenerationCost, 
  getVideoModelSpecs,
  type VideoModel,
  type VideoGenerationOptions 
} from "./runwareVideo";
import { notifyNewSignup } from "./lineNotify";
import { upsertUser } from "./db";
import { createCharge, createSource, getChargeStatus, CREDIT_PACKAGES, getCreditPackage } from "./omise";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(async (opts) => {
      const user = opts.ctx.user;
      if (user) {
        // TESTING MODE: Skip database operations
        console.log("🚧 Testing Mode: Skipping credit initialization and notifications");
        /*
        // Initialize credits for new users
        await initializeUserCredits(user.id);
        
        // Check if this is a new sign-up (no lastSignedIn or very recent)
        const isNewSignup = !user.lastSignedIn || 
          (new Date().getTime() - new Date(user.lastSignedIn).getTime() < 5000);
        
        if (isNewSignup) {
          // Send LINE notification for new sign-up
          await notifyNewSignup(user);
        }
        */
      }
      return user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  credits: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      // TESTING MODE: Return mock credits
      console.log("🚧 Testing Mode: Returning mock credit balance");
      return {
        balance: 1000, // Mock balance for testing
      };
    }),
    
    getTransactions: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        // TESTING MODE: Return empty transactions
        console.log("🚧 Testing Mode: Returning empty transactions");
        return [];
      }),
  }),

  generations: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getUserGenerations(ctx.user.id, input.limit);
      }),

    generateImage: protectedProcedure
      .input(
        z.object({
          prompt: z.string().min(1),
          provider: z.enum(["runware", "replicate"]),
          model: z.string().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          steps: z.number().optional(),
          aspectRatio: z.string().optional(),
          imageUrls: z.array(z.string().url()).optional(), // For image-to-image generation
          seed: z.number().optional(), // Add seed parameter
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const generationId = crypto.randomUUID();

        console.log("🎯 Generate Image Request:", {
          userId,
          generationId,
          input
        });

        try {
          // Generate image based on provider
          let result;
          let apiCostInDollars = 0;

          if (input.provider === "runware") {
            // Map model names to Runware model IDs
            let runwareModel = "runware:10101@1"; // Default FLUX.1 [dev]
            let estimatedCost = 0.0038;
            
            if (input.model === "flux-schnell") {
              runwareModel = "runware:10101@1"; // FLUX.1 [schnell] - need correct ID
              estimatedCost = 0.0013;
            } else if (input.model === "flux-dev") {
              runwareModel = "runware:10101@1"; // FLUX.1 [dev]
              estimatedCost = 0.0038;
            } else if (input.model === "seedream") {
              // Use dedicated Seedream module
              result = await generateImageSeedream({
                prompt: input.prompt,
                width: input.width,
                height: input.height,
                seed: input.seed,
                num_outputs: 1,
              });
              
              // Calculate cost using Seedream pricing
              estimatedCost = calculateSeedreamCost({
                prompt: input.prompt,
                width: input.width,
                height: input.height,
                seed: input.seed,
                num_outputs: 1,
              }) / 100; // Convert from credits to dollars
              
              return result;
            }
            
            result = await generateImageRunware({
              prompt: input.prompt,
              model: runwareModel,
              width: input.width,
              height: input.height,
              steps: input.steps,
            });
            apiCostInDollars = result.cost || estimatedCost;
          } else {
            // Nano Banana - according to official docs, only prompt and image_input are supported
            result = await generateImageNanoBanana({
              prompt: input.prompt,
              imageUrls: input.imageUrls, // Pass image URLs for image-to-image generation
              // Note: aspectRatio and outputFormat are not supported by nano-banana
              // The model determines these automatically
            });
            apiCostInDollars = result.cost || 0.039;
          }

          if (!result.success) {
            throw new Error(result.error || "Generation failed");
          }

          // Convert cost to cents and apply 30% markup
          const apiCostInCents = Math.ceil(apiCostInDollars * 100);
          const userCostInCents = Math.ceil(apiCostInCents * 1.3);

          // TESTING MODE: Skip database operations for now
          console.log("🚧 Testing Mode: Skipping database operations");
          console.log("💰 Cost calculation:", { apiCostInCents, userCostInCents });

          // TODO: Re-enable database operations when database is set up
          /*
          // Check if user has enough credits
          const userCredits = await getUserCredits(userId);
          const currentBalance = userCredits?.balance || 0;

          if (currentBalance < userCostInCents) {
            throw new Error("Insufficient credits");
          }

          // Deduct credits
          await deductCredits(
            userId,
            userCostInCents,
            `Image generation: ${input.prompt.substring(0, 50)}`
          );

          // Save generation record
          await createGeneration({
            id: generationId,
            userId,
            provider: input.provider,
            type: "text_to_image",
            prompt: input.prompt,
            model: input.model || null,
            parameters: JSON.stringify({
              width: input.width,
              height: input.height,
              steps: input.steps,
            }),
            status: "completed",
            resultUrl: result.imageUrl || null,
            apiCost: apiCostInCents,
            userCost: userCostInCents,
            processingTime: result.processingTime || null,
            completedAt: new Date(),
          });
          */

          const response = {
            success: true,
            generationId,
            imageUrl: result.imageUrl,
            cost: userCostInCents,
          };

          console.log("✅ Generation Success Response:", response);
          return response;
        } catch (error) {
          // Save failed generation record
          await createGeneration({
            id: generationId,
            userId,
            provider: input.provider,
            type: "text_to_image",
            prompt: input.prompt,
            model: input.model || null,
            parameters: JSON.stringify({
              width: input.width,
              height: input.height,
              steps: input.steps,
            }),
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            apiCost: 0,
            userCost: 0,
          });

          throw error;
        }
      }),

    generateVideo: protectedProcedure
      .input(
        z.object({
          prompt: z.string().min(1),
          model: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const generationId = crypto.randomUUID();

        try {
          // Generate video using Replicate
          const result = await generateVideoReplicate({
            prompt: input.prompt,
            model: input.model,
          });

          if (!result.success) {
            throw new Error(result.error || "Video generation failed");
          }

          // Convert cost to cents and apply 30% markup
          const apiCostInCents = Math.ceil((result.cost || 0.5) * 100);
          const userCostInCents = Math.ceil(apiCostInCents * 1.3);

          // Check if user has enough credits - TESTING MODE
          console.log("🚧 Testing Mode: Using mock credits for Replicate video generation");
          const mockCredits = { balance: 1000 }; // Mock credits for testing
          const currentBalance = mockCredits.balance;

          if (currentBalance < userCostInCents) {
            throw new Error("Insufficient credits");
          }

          // Deduct credits
          await deductCredits(
            userId,
            userCostInCents,
            `Video generation: ${input.prompt.substring(0, 50)}`
          );

          // Save generation record
          await createGeneration({
            id: generationId,
            userId,
            provider: "replicate",
            type: "text_to_video",
            prompt: input.prompt,
            model: input.model || null,
            parameters: JSON.stringify({}),
            status: "completed",
            resultUrl: result.videoUrl || null,
            apiCost: apiCostInCents,
            userCost: userCostInCents,
            processingTime: result.processingTime || null,
            completedAt: new Date(),
          });

          return {
            success: true,
            generationId,
            videoUrl: result.videoUrl,
            cost: userCostInCents,
          };
        } catch (error) {
          // Save failed generation record
          await createGeneration({
            id: generationId,
            userId,
            provider: "replicate",
            type: "text_to_video",
            prompt: input.prompt,
            model: input.model || null,
            parameters: JSON.stringify({}),
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            apiCost: 0,
            userCost: 0,
          });

          throw error;
        }
      }),
  }),

  payments: router({
    getPackages: publicProcedure.query(() => {
      return CREDIT_PACKAGES;
    }),

    createPayment: protectedProcedure
      .input(
        z.object({
          packageId: z.string(),
          paymentMethod: z.enum(["card", "promptpay", "truemoney"]),
          token: z.string().optional(), // Omise token for card payments
          returnUri: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const pkg = getCreditPackage(input.packageId);

        if (!pkg) {
          throw new Error("Invalid package");
        }

        try {
          let chargeResult;

          if (input.paymentMethod === "card") {
            // Card payment with token
            if (!input.token) {
              throw new Error("Payment token required for card payment");
            }

            chargeResult = await createCharge({
              amount: pkg.price * 100, // Convert to satangs (smallest unit)
              description: `${pkg.name} - ${pkg.credits} credits`,
              source: input.token,
            });
          } else {
            // PromptPay or TrueMoney
            const sourceResult = await createSource({
              type: input.paymentMethod === "promptpay" ? "promptpay" : "truemoney",
              amount: pkg.price * 100,
            });

            if (!sourceResult.success || !sourceResult.sourceId) {
              throw new Error(sourceResult.error || "Failed to create payment source");
            }

            chargeResult = await createCharge({
              amount: pkg.price * 100,
              description: `${pkg.name} - ${pkg.credits} credits`,
              source: sourceResult.sourceId,
              returnUri: input.returnUri,
            });
          }

          if (!chargeResult.success) {
            throw new Error(chargeResult.error || "Payment failed");
          }

          // If payment is successful, add credits immediately
          if (chargeResult.status === "successful") {
            await addCredits(
              userId,
              pkg.credits,
              `Purchase: ${pkg.name}`,
              input.paymentMethod,
              chargeResult.chargeId
            );
          }

          return {
            success: true,
            chargeId: chargeResult.chargeId,
            status: chargeResult.status,
            authorizeUri: chargeResult.authorizeUri,
          };
        } catch (error) {
          console.error("[Payment] Error:", error);
          throw error;
        }
      }),

      checkPaymentStatus: protectedProcedure
        .input(z.object({ chargeId: z.string() }))
        .query(async ({ ctx, input }) => {
          const result = await getChargeStatus(input.chargeId);
          
          // If payment is now successful, add credits
          if (result.paid && result.status === "successful") {
            // Find the transaction to get package details
            // For now, we'll need to track this separately or pass package info
            // This is a simplified version
          }

          return result;
        }),
    }),

    // Video Generation Endpoints
    video: router({
      // Get available video models and their specifications
      getModels: publicProcedure
        .query(() => {
          return getVideoModelSpecs();
        }),

      // Test image processing for debugging
      testImage: publicProcedure
        .input(z.object({
          imageBase64: z.string(), // Raw base64 without data URI prefix
        }))
        .mutation(async ({ input }) => {
          console.log("🧪 Testing image processing...");
          console.log("🖼️ Received image data length:", input.imageBase64.length);
          console.log("🖼️ First 50 chars:", input.imageBase64.substring(0, 50));
          
          // Test the same processing as in generateVideoRunware
          const testOptions: VideoGenerationOptions = {
            model: "veo-3-fast",
            prompt: "Test prompt",
            duration: 8,
            inputImage: input.imageBase64,
            width: 1280,
            height: 720,
          };
          
          try {
            // This will run through all our debugging without actually calling the API
            console.log("🔄 Processing with buildRunwareRequest...");
            // We'll just test the image processing part
            const spec = getVideoModelSpecs()["veo-3-fast"];
            let imageData = testOptions.inputImage;
            
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
            }
            
            const frameImages = [{
              inputImages: imageData,
              frame: "first"
            }];
            
            console.log("🛠️ Final frameImages structure:", JSON.stringify(frameImages, null, 2));
            
            return {
              success: true,
              processedImageLength: imageData.length,
              frameImages: frameImages,
              detectedMimeType: imageData.includes('image/png') ? 'image/png' : 
                               imageData.includes('image/webp') ? 'image/webp' : 'image/jpeg',
            };
            
          } catch (error) {
            console.error("❌ Test error:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        }),

      // Generate video using Runware API
      generate: protectedProcedure
        .input(
          z.object({
            prompt: z.string().min(2),
            model: z.enum(["veo-3-fast", "seedance-pro", "seedance-lite", "hailuo-02", "sora-2", "sora-2-pro"]),
            duration: z.number().min(3).max(20),
            width: z.number().optional(),
            height: z.number().optional(),
            inputImage: z.string().optional(), // Base64 encoded image or URL
            generateAudio: z.boolean().optional(),
            cameraFixed: z.boolean().optional(),
            promptOptimizer: z.boolean().optional(),
            seed: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const userId = ctx.user.id;
          const generationId = crypto.randomUUID();

          console.log("🎬 Video Generate Request:", {
            userId,
            model: input.model,
            duration: `${input.duration}s`,
            dimensions: `${input.width || 'auto'}×${input.height || 'auto'}`,
          });

          // Calculate cost
          const estimatedCostCredits = calculateVideoGenerationCost(input);
          const estimatedCostUSD = estimatedCostCredits / 100;

          console.log("💰 Estimated cost:", { credits: estimatedCostCredits, usd: estimatedCostUSD });

          // Check user credits - TESTING MODE
          console.log("🚧 Testing Mode: Using mock credits for video generation");
          const mockCredits = { balance: 1000 }; // Mock credits for testing
          if (mockCredits.balance < estimatedCostCredits) {
            const available = mockCredits.balance;
            throw new Error(`Insufficient credits. Required: ${estimatedCostCredits}, Available: ${available}`);
          }

          // Create generation record
          await createGeneration({
            id: generationId,
            userId,
            provider: "runware",
            type: input.inputImage ? "image_to_video" : "text_to_video",
            model: input.model,
            prompt: input.prompt,
            parameters: JSON.stringify({
              duration: input.duration,
              width: input.width,
              height: input.height,
              generateAudio: input.generateAudio,
              cameraFixed: input.cameraFixed,
              promptOptimizer: input.promptOptimizer,
              seed: input.seed,
              hasInputImage: !!input.inputImage,
            }),
            status: "processing",
            apiCost: 0, // Will update when completed
            userCost: estimatedCostCredits,
          });

          try {
            // Debug: Log input before generation
            console.log("🔍 Input to generateVideoRunware:", {
              ...input,
              inputImage: input.inputImage ? `${typeof input.inputImage} (${input.inputImage.substring(0, 50)}...)` : 'undefined'
            });
            
            // Start video generation
            const result = await generateVideoRunware(input as VideoGenerationOptions);

            // Update generation status and store taskUUID in parameters for later lookup
            const currentParams = JSON.parse(await (async () => {
              const gen = await getUserGenerations(userId, 1);
              return gen[0]?.parameters || "{}";
            })());
            
            await updateGeneration(generationId, {
              status: "processing",
              parameters: JSON.stringify({
                ...currentParams,
                taskUUID: result.taskUUID,
              }),
            });

            return {
              success: true,
              generationId,
              taskUUID: result.taskUUID,
              estimatedCredits: estimatedCostCredits,
              status: "processing",
            };
          } catch (error) {
            console.error("❌ Video generation failed:", error);
            
            // Update generation status
            await updateGeneration(generationId, {
              status: "failed",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
            });

            throw error;
          }
        }),

      // Poll for video generation result
      poll: protectedProcedure
        .input(z.object({ taskUUID: z.string() }))
        .query(async ({ ctx, input }) => {
          try {
            const result = await pollVideoResult(input.taskUUID);
            
            // If video is completed, update generation record and deduct credits
            if (result.status === "success" && result.videoURL) {
              // Find the generation by taskUUID in parameters JSON
              const generations = await getUserGenerations(ctx.user.id, 10);
              const generation = generations.find(g => {
                try {
                  const params = g.parameters ? JSON.parse(g.parameters) : {};
                  return params.taskUUID === input.taskUUID;
                } catch {
                  return false;
                }
              });
              
              if (generation && generation.status === "processing") {
                // Parse parameters from JSON string
                const params = generation.parameters ? JSON.parse(generation.parameters) : {};
                
                // Calculate final cost
                const finalCost = result.cost ? Math.ceil(result.cost * 100) : calculateVideoGenerationCost({
                  model: generation.model as VideoModel,
                  duration: params.duration || 5,
                  width: params.width,
                  height: params.height,
                  generateAudio: params.generateAudio,
                  prompt: generation.prompt || "",
                });

                // Deduct credits
                await deductCredits(
                  ctx.user.id,
                  finalCost,
                  `Video Generation: ${generation.model}`
                );

                // Update generation record
                await updateGeneration(generation.id, {
                  status: "completed",
                  resultUrl: result.videoURL,
                  completedAt: new Date(),
                });
              }
            }

            return result;
          } catch (error) {
            console.error("❌ Failed to poll video result:", error);
            throw new Error(`Failed to get video status: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }),

      // Get video generation history
      history: protectedProcedure
        .input(z.object({ limit: z.number().optional() }))
        .query(async ({ ctx, input }) => {
          const generations = await getUserGenerations(ctx.user.id, input.limit);
          return generations.filter(g => g.type === "text_to_video" || g.type === "image_to_video");
        }),
    }),
  });export type AppRouter = typeof appRouter;
