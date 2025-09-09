import { type User, type InsertUser, type Video, type InsertVideo, type ProcessingStep, type InsertProcessingStep } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined>;
  getVideos(): Promise<Video[]>;
  
  getProcessingSteps(videoId: string): Promise<ProcessingStep[]>;
  createProcessingStep(step: InsertProcessingStep): Promise<ProcessingStep>;
  updateProcessingStep(id: string, updates: Partial<ProcessingStep>): Promise<ProcessingStep | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private videos: Map<string, Video>;
  private processingSteps: Map<string, ProcessingStep>;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.processingSteps = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getVideo(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const now = new Date();
    const video: Video = {
      ...insertVideo,
      id,
      vrPath: null,
      mobileVrPath: null,
      status: "uploaded",
      progress: 0,
      duration: insertVideo.duration || null,
      resolution: insertVideo.resolution || null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = {
      ...video,
      ...updates,
      updatedAt: new Date(),
    };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async getProcessingSteps(videoId: string): Promise<ProcessingStep[]> {
    return Array.from(this.processingSteps.values())
      .filter(step => step.videoId === videoId)
      .sort((a, b) => (a.startedAt?.getTime() || 0) - (b.startedAt?.getTime() || 0));
  }

  async createProcessingStep(insertStep: InsertProcessingStep): Promise<ProcessingStep> {
    const id = randomUUID();
    const step: ProcessingStep = {
      ...insertStep,
      id,
      status: insertStep.status || "pending",
      progress: insertStep.progress || 0,
      startedAt: null,
      completedAt: null,
      errorMessage: null,
    };
    this.processingSteps.set(id, step);
    return step;
  }

  async updateProcessingStep(id: string, updates: Partial<ProcessingStep>): Promise<ProcessingStep | undefined> {
    const step = this.processingSteps.get(id);
    if (!step) return undefined;
    
    const updatedStep = { ...step, ...updates };
    this.processingSteps.set(id, updatedStep);
    return updatedStep;
  }
}

export const storage = new MemStorage();
