import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FolderOpen, Video as VideoIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Video } from "@shared/schema";

interface FileUploadProps {
  onVideoUploaded: (video: Video) => void;
}

interface FileInfo {
  file: File;
  name: string;
  size: string;
  duration?: string;
  resolution?: string;
}

export default function FileUpload({ onVideoUploaded }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("video", file);
      
      const response = await apiRequest("POST", "/api/videos/upload", formData);
      return response.json();
    },
    onSuccess: (video: Video) => {
      toast({
        title: "Upload successful",
        description: "Your video has been uploaded and processing will begin shortly.",
      });
      onVideoUploaded(video);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileInfo: FileInfo = {
        file,
        name: file.name,
        size: formatFileSize(file.size),
      };
      
      // Get video duration and resolution if possible
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        fileInfo.duration = formatDuration(video.duration);
        fileInfo.resolution = `${video.videoWidth}x${video.videoHeight}`;
        setSelectedFile({ ...fileInfo });
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
      
      setSelectedFile(fileInfo);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection) {
        const errorMessage = rejection.errors[0]?.message || "File rejected";
        toast({
          title: "File rejected",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile.file);
    }
  };

  return (
    <Card className="bg-card rounded-xl border border-border">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Upload Your 2D Video</h3>
          <p className="text-muted-foreground">
            Supported formats: MP4, MOV, AVI • Max size: 500MB • Recommended: 1080p or higher
          </p>
        </div>

        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`upload-zone rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? "dragover" : ""
            }`}
            data-testid="upload-zone"
          >
            <input {...getInputProps()} data-testid="file-input" />
            <div className="mb-4">
              <CloudUpload className="w-16 h-16 text-primary mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">
                {isDragActive ? "Drop your video here" : "Drag & Drop your video here"}
              </h4>
              <p className="text-muted-foreground mb-4">or click to browse files</p>
              <Button data-testid="button-choose-file">
                <FolderOpen className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-secondary rounded-lg" data-testid="file-info">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <VideoIcon className="text-primary text-2xl w-8 h-8" />
                <div>
                  <p className="font-medium" data-testid="file-name">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <span data-testid="file-size">{selectedFile.size}</span>
                    {selectedFile.duration && (
                      <>
                        {" • "}
                        <span data-testid="file-duration">{selectedFile.duration}</span>
                      </>
                    )}
                    {selectedFile.resolution && (
                      <>
                        {" • "}
                        <span data-testid="file-resolution">{selectedFile.resolution}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  data-testid="button-start-conversion"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Start Conversion"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive/80"
                  data-testid="button-remove-file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
