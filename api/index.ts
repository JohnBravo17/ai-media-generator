import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response } from "express";
import multer from "multer";

// Extend Request interface to include multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from '../server/routers';
import { createContext } from '../server/_core/context';
import { uploadFileToReplicate } from "../server/nanoBanana";

// Create Express app for API handling
const app = express();

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
app.post('/api/upload', upload.single('file'), async (req: MulterRequest, res: Response) => {
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

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export handler for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};