import { CheckCircle, Download, Headset, Smartphone, Share2, Link, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Video } from "@shared/schema";

interface DownloadResultsProps {
  video: Video;
  onStartOver: () => void;
}

export default function DownloadResults({ video, onStartOver }: DownloadResultsProps) {
  const { toast } = useToast();

  const handleDownload = async (type: "vr" | "mobile") => {
    try {
      const response = await fetch(`/api/videos/${video.id}/download/${type}`);
      if (!response.ok) {
        throw new Error("Download failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${video.originalFilename}_${type === "vr" ? "VR180" : "VR180_Mobile"}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `Your ${type === "vr" ? "VR 180°" : "Mobile VR"} video download has started.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    toast({
      title: "Share feature",
      description: `Share to ${platform} functionality would be implemented here.`,
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Video link has been copied to clipboard.",
    });
  };

  return (
    <Card className="bg-card rounded-xl border border-border" data-testid="download-section">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-success text-3xl w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold mb-2">VR Conversion Complete!</h3>
          <p className="text-muted-foreground">Your VR 180° video is ready for download</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Download Options */}
          <Card className="bg-secondary border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Headset className="text-primary text-2xl w-8 h-8" />
                  <div>
                    <h4 className="font-semibold">VR 180° Video (High Quality)</h4>
                    <p className="text-sm text-muted-foreground">3840x1920 • Stereoscopic • 245.7 MB</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleDownload("vr")}
                  data-testid="button-download-vr-hq"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="mr-1">ℹ️</span>
                Compatible with Oculus Quest, HTC Vive, PICO, and other VR headsets
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Smartphone className="text-accent text-2xl w-8 h-8" />
                  <div>
                    <h4 className="font-semibold">Mobile VR Version</h4>
                    <p className="text-sm text-muted-foreground">1920x960 • Optimized • 98.2 MB</p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => handleDownload("mobile")}
                  data-testid="button-download-mobile"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="mr-1">ℹ️</span>
                Perfect for smartphone VR viewers and Google Cardboard
              </div>
            </CardContent>
          </Card>

          {/* Sharing Options */}
          <div className="pt-6 border-t border-border">
            <h4 className="font-semibold mb-4 text-center">Share Your VR Experience</h4>
            <div className="flex justify-center space-x-4">
              <Button
                size="icon"
                className="bg-[#1877f2] hover:bg-[#1877f2]/90"
                onClick={() => handleShare("Facebook")}
                data-testid="button-share-facebook"
              >
                <span className="text-white font-bold">f</span>
              </Button>
              <Button
                size="icon"
                className="bg-[#1da1f2] hover:bg-[#1da1f2]/90"
                onClick={() => handleShare("Twitter")}
                data-testid="button-share-twitter"
              >
                <span className="text-white font-bold">𝕏</span>
              </Button>
              <Button
                size="icon"
                className="bg-[#0077b5] hover:bg-[#0077b5]/90"
                onClick={() => handleShare("LinkedIn")}
                data-testid="button-share-linkedin"
              >
                <span className="text-white font-bold">in</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={copyLink}
                data-testid="button-copy-link"
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Start Over Button */}
          <div className="pt-6 text-center">
            <Button 
              variant="outline" 
              onClick={onStartOver}
              data-testid="button-start-over"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Convert Another Video
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
