import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertVideoSchema } from "@shared/schema";
import { VideoProcessor } from "./services/video-processor";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['.mp4', '.mov', '.avi'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, and AVI files are allowed.'));
    }
  },
});

const videoProcessor = new VideoProcessor(storage);

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload video endpoint
  app.post("/api/videos/upload", (req, res, next) => {
    upload.single("video")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }, async (req: any, res) => {
    try {
      console.log("Upload request received:", {
        file: req.file ? "File present" : "No file",
        body: req.body,
        headers: req.headers['content-type']
      });
      
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const { originalname, path: filePath, size } = req.file;
      
      // Get video metadata (duration, resolution)
      const metadata = await videoProcessor.getVideoMetadata(filePath);
      
      const videoData = {
        originalFilename: originalname,
        originalPath: filePath,
        fileSize: size,
        duration: metadata.duration,
        resolution: metadata.resolution,
      };

      const validatedData = insertVideoSchema.parse(videoData);
      const video = await storage.createVideo(validatedData);

      // Start processing in background
      videoProcessor.processVideo(video.id).catch(console.error);

      res.json(video);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // Get video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Get video error:", error);
      res.status(500).json({ message: "Failed to get video" });
    }
  });

  // Get processing steps for a video
  app.get("/api/videos/:id/steps", async (req, res) => {
    try {
      const steps = await storage.getProcessingSteps(req.params.id);
      res.json(steps);
    } catch (error) {
      console.error("Get processing steps error:", error);
      res.status(500).json({ message: "Failed to get processing steps" });
    }
  });

  // Download VR video
  app.get("/api/videos/:id/download/:type", async (req, res) => {
    try {
      const { id, type } = req.params;
      const video = await storage.getVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      let filePath: string | null = null;
      let filename = "";

      if (type === "vr" && video.vrPath) {
        filePath = video.vrPath;
        filename = `${path.parse(video.originalFilename).name}_VR180.mp4`;
      } else if (type === "mobile" && video.mobileVrPath) {
        filePath = video.mobileVrPath;
        filename = `${path.parse(video.originalFilename).name}_VR180_Mobile.mp4`;
      }

      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({ message: "VR video not found" });
      }

      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "video/mp4");
      
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download video" });
    }
  });

  // Get all videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ message: "Failed to get videos" });
    }
  });

  // Delete video
  app.delete("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Clean up files
      if (fs.existsSync(video.originalPath)) {
        fs.unlinkSync(video.originalPath);
      }
      if (video.vrPath && fs.existsSync(video.vrPath)) {
        fs.unlinkSync(video.vrPath);
      }
      if (video.mobileVrPath && fs.existsSync(video.mobileVrPath)) {
        fs.unlinkSync(video.mobileVrPath);
      }

      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
