import { apiRequest } from "./queryClient";
import type { Video } from "@shared/schema";

export const uploadVideo = async (file: File): Promise<Video> => {
  const formData = new FormData();
  formData.append("video", file);
  
  const response = await apiRequest("POST", "/api/videos/upload", formData);
  return response.json();
};

export const getVideo = async (id: string): Promise<Video> => {
  const response = await apiRequest("GET", `/api/videos/${id}`);
  return response.json();
};

export const getProcessingSteps = async (videoId: string) => {
  const response = await apiRequest("GET", `/api/videos/${videoId}/steps`);
  return response.json();
};

export const downloadVideo = async (videoId: string, type: "vr" | "mobile"): Promise<Blob> => {
  const response = await apiRequest("GET", `/api/videos/${videoId}/download/${type}`);
  return response.blob();
};
