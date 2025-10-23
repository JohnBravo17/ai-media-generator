import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
// import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { uploadFileToReplicate } from "../nanoBanana";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Configure multer for file uploads (store in memory)
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit (Replicate's limit)
    },
    fileFilter: (req, file, cb) => {
      // Allow common image formats
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });

  // File upload endpoint
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      console.log('[Upload] Received file:', {
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });

      // Upload to Replicate
      const result = await uploadFileToReplicate({
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
      });

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        url: result.url,
        filename: req.file.originalname,
        size: req.file.size,
      });

    } catch (error) {
      console.error('[Upload] Error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
    }
  });

  // Test endpoint for debugging image processing
  app.post('/api/test-image', express.json(), async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      console.log("🧪 Testing image processing...");
      console.log("🖼️ Received image data length:", imageBase64.length);
      console.log("🖼️ First 50 chars:", imageBase64.substring(0, 50));
      
      // Import the video generation functions
      const { getVideoModelSpecs } = await import('../runwareVideo');
      
      // Test the same processing logic
      let imageData = imageBase64;
      
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
      
      res.json({
        success: true,
        processedImageLength: imageData.length,
        frameImages: frameImages,
        detectedMimeType: imageData.includes('image/png') ? 'image/png' : 
                         imageData.includes('image/webp') ? 'image/webp' : 'image/jpeg',
      });
      
    } catch (error) {
      console.error("❌ Test error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Serve test HTML file
  app.get('/test-image.html', (req, res) => {
    res.sendFile('test-image.html', { root: process.cwd() });
  });

  // OAuth callback under /api/oauth/callback - DISABLED FOR TESTING
  // registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
