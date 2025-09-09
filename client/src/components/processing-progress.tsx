import { useEffect } from "react";
import { CheckCircle, Clock, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Video, ProcessingStep } from "@shared/schema";

interface ProcessingProgressProps {
  video: Video;
  onComplete: () => void;
}

export default function ProcessingProgress({ video, onComplete }: ProcessingProgressProps) {
  // Poll video status
  const { data: currentVideo } = useQuery<Video>({
    queryKey: ["/api/videos", video.id],
    refetchInterval: 2000,
    enabled: video.status !== "completed",
  });

  // Poll processing steps
  const { data: steps = [] } = useQuery<ProcessingStep[]>({
    queryKey: ["/api/videos", video.id, "steps"],
    refetchInterval: 2000,
    enabled: video.status !== "completed",
  });

  useEffect(() => {
    if (currentVideo?.status === "completed") {
      onComplete();
    }
  }, [currentVideo?.status, onComplete]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-success" />;
      case "processing":
        return <Loader className="text-primary animate-spin" />;
      default:
        return <Clock className="text-muted-foreground" />;
    }
  };

  const getStepStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing...";
      default:
        return "Waiting...";
    }
  };

  const formatStepName = (stepName: string) => {
    return stepName
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const estimateTimeRemaining = () => {
    const progress = currentVideo?.progress || 0;
    if (progress < 25) return "4-5 minutes";
    if (progress < 60) return "2-3 minutes";
    if (progress < 85) return "1-2 minutes";
    return "Less than 1 minute";
  };

  return (
    <Card className="bg-card rounded-xl border border-border" data-testid="processing-section">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Converting to VR 180°</h3>
          <p className="text-muted-foreground">Our AI is analyzing depth and creating stereoscopic views...</p>
        </div>

        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground" data-testid="progress-percentage">
              {currentVideo?.progress || 0}%
            </span>
          </div>
          <Progress 
            value={currentVideo?.progress || 0} 
            className="h-3"
            data-testid="progress-bar"
          />
        </div>

        {/* Processing Steps */}
        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((step) => (
            <Card key={step.id} className="bg-secondary p-4" data-testid={`step-${step.stepName}`}>
              <div className="flex items-center mb-2">
                {getStepIcon(step.status)}
                <span className="text-sm font-medium ml-2">
                  {formatStepName(step.stepName)}
                </span>
              </div>
              <Progress 
                value={step.progress} 
                className="h-2 mb-1"
                data-testid={`step-progress-${step.stepName}`}
              />
              <p className="text-xs text-muted-foreground">
                {getStepStatusText(step.status)}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
          <div className="flex items-center">
            <Clock className="text-primary mr-2 h-4 w-4" />
            <span className="text-sm">
              Estimated time remaining: {" "}
              <span className="font-medium text-foreground" data-testid="time-remaining">
                {estimateTimeRemaining()}
              </span>
            </span>
          </div>
        </div>

        {currentVideo?.status === "failed" && (
          <div className="mt-6 p-4 bg-destructive/20 rounded-lg border border-destructive/30">
            <div className="flex items-center">
              <span className="text-sm text-destructive">
                Processing failed: {currentVideo.errorMessage || "Unknown error"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
