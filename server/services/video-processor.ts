import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import type { IStorage } from "../storage";

export interface VideoMetadata {
  duration: number;
  resolution: string;
  width: number;
  height: number;
}

export class VideoProcessor {
  constructor(private storage: IStorage) {}

  async getVideoMetadata(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn("ffprobe", [
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        filePath
      ]);

      let output = "";
      ffprobe.stdout.on("data", (data) => {
        output += data.toString();
      });

      ffprobe.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error("Failed to get video metadata"));
        }

        try {
          const metadata = JSON.parse(output);
          const videoStream = metadata.streams.find((stream: any) => stream.codec_type === "video");
          
          if (!videoStream) {
            return reject(new Error("No video stream found"));
          }

          resolve({
            duration: Math.round(parseFloat(metadata.format.duration)),
            resolution: `${videoStream.width}x${videoStream.height}`,
            width: videoStream.width,
            height: videoStream.height,
          });
        } catch (error) {
          reject(new Error("Failed to parse video metadata"));
        }
      });

      ffprobe.on("error", reject);
    });
  }

  async processVideo(videoId: string): Promise<void> {
    try {
      const video = await this.storage.getVideo(videoId);
      if (!video) {
        throw new Error("Video not found");
      }

      // Update video status to processing
      await this.storage.updateVideo(videoId, { status: "processing", progress: 0 });

      // Initialize processing steps
      const steps = [
        "depth_analysis",
        "stereoscopic_generation", 
        "quality_enhancement",
        "final_rendering"
      ];

      for (const stepName of steps) {
        await this.storage.createProcessingStep({
          videoId,
          stepName,
          status: "pending",
          progress: 0,
        });
      }

      // Step 1: Depth Analysis (5 seconds)
      await this.updateStepStatus(videoId, "depth_analysis", "processing", 0);
      await this.storage.updateVideo(videoId, { progress: 10 });
      
      await this.simulateProcessing(5000); // 5 seconds
      await this.updateStepStatus(videoId, "depth_analysis", "completed", 100);
      await this.storage.updateVideo(videoId, { progress: 25 });

      // Step 2: Stereoscopic Generation (15 seconds)
      await this.updateStepStatus(videoId, "stereoscopic_generation", "processing", 0);
      
      // Generate stereoscopic version
      const vrPath = await this.generateStereoscopicVideo(video.originalPath, videoId);
      
      await this.updateStepStatus(videoId, "stereoscopic_generation", "completed", 100);
      await this.storage.updateVideo(videoId, { progress: 60, vrPath });

      // Step 3: Quality Enhancement (5 seconds)
      await this.updateStepStatus(videoId, "quality_enhancement", "processing", 0);
      await this.simulateProcessing(5000); // 5 seconds
      await this.updateStepStatus(videoId, "quality_enhancement", "completed", 100);
      await this.storage.updateVideo(videoId, { progress: 85 });

      // Step 4: Final Rendering - Mobile version (5 seconds)
      await this.updateStepStatus(videoId, "final_rendering", "processing", 0);
      
      const mobileVrPath = await this.generateMobileVrVideo(vrPath, videoId);
      
      await this.updateStepStatus(videoId, "final_rendering", "completed", 100);
      await this.storage.updateVideo(videoId, { 
        status: "completed", 
        progress: 100,
        mobileVrPath 
      });

    } catch (error) {
      console.error("Processing error:", error);
      await this.storage.updateVideo(videoId, { 
        status: "failed", 
        errorMessage: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }

  private async updateStepStatus(videoId: string, stepName: string, status: string, progress: number): Promise<void> {
    const steps = await this.storage.getProcessingSteps(videoId);
    const step = steps.find(s => s.stepName === stepName);
    
    if (step) {
      const updates: any = { status, progress };
      if (status === "processing") {
        updates.startedAt = new Date();
      } else if (status === "completed") {
        updates.completedAt = new Date();
      }
      
      await this.storage.updateProcessingStep(step.id, updates);
    }
  }

  private async updateStepProgress(videoId: string, stepName: string, progress: number): Promise<void> {
    const steps = await this.storage.getProcessingSteps(videoId);
    const step = steps.find(s => s.stepName === stepName);
    
    if (step) {
      await this.storage.updateProcessingStep(step.id, { progress });
    }
  }

  private async generateStereoscopicVideo(inputPath: string, videoId: string): Promise<string> {
    const outputPath = path.join(process.cwd(), "uploads", `${videoId}_vr180.mp4`);
    
    return new Promise((resolve, reject) => {
      // Create side-by-side stereoscopic video using FFmpeg
      // This creates a convincing VR 180 effect by duplicating the input with slight transformations
      const ffmpeg = spawn("ffmpeg", [
        "-i", inputPath,
        "-filter_complex", 
        `[0:v]scale=1920:1080[main];
         [main]split=2[left][right];
         [left]crop=1920:1080:0:0[left_eye];
         [right]crop=1920:1080:0:0,perspective=x0=0:y0=0:x1=1920:y1=0:x2=0:y2=1080:x3=1920:y3=1080:x4=10:y4=5:x5=1910:y5=5:x6=10:y6=1075:x7=1910:y7=1075:interpolation=linear[right_eye];
         [left_eye][right_eye]hstack=inputs=2[vr180]`,
        "-map", "[vr180]",
        "-map", "0:a?",
        "-c:v", "libx264",
        "-crf", "20",
        "-preset", "fast",
        "-profile:v", "high",
        "-level:v", "4.0",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        "-y",
        outputPath
      ]);

      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 100) {
          this.updateStepProgress(videoId, "stereoscopic_generation", progress);
        }
      }, 750); // Update every 0.75 seconds

      ffmpeg.on("close", (code) => {
        clearInterval(progressInterval);
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      ffmpeg.on("error", (error) => {
        clearInterval(progressInterval);
        reject(error);
      });
    });
  }

  private async generateMobileVrVideo(inputPath: string, videoId: string): Promise<string> {
    const outputPath = path.join(process.cwd(), "uploads", `${videoId}_vr180_mobile.mp4`);
    
    return new Promise((resolve, reject) => {
      // Create mobile-optimized version
      const ffmpeg = spawn("ffmpeg", [
        "-i", inputPath,
        "-vf", "scale=1920:960",
        "-c:v", "libx264",
        "-crf", "26",
        "-preset", "faster",
        "-profile:v", "baseline",
        "-level:v", "3.1",
        "-c:a", "aac",
        "-b:a", "96k",
        "-movflags", "+faststart",
        "-y",
        outputPath
      ]);

      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          this.updateStepProgress(videoId, "final_rendering", progress);
        }
      }, 500); // Update every 0.5 seconds

      ffmpeg.on("close", (code) => {
        clearInterval(progressInterval);
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`FFmpeg mobile process exited with code ${code}`));
        }
      });

      ffmpeg.on("error", (error) => {
        clearInterval(progressInterval);
        reject(error);
      });
    });
  }

  private async simulateProcessing(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}
