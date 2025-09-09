import { Headset, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Video } from "@shared/schema";

interface VideoPreviewProps {
  video: Video;
  onAccept: () => void;
  onRegenerate: () => void;
}

export default function VideoPreview({ video, onAccept, onRegenerate }: VideoPreviewProps) {
  return (
    <Card className="bg-card rounded-xl border border-border" data-testid="preview-section">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Preview Your VR 180° Video</h3>
          <p className="text-muted-foreground">Compare the original with your new VR experience</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Original Video */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <span className="mr-2 text-muted-foreground">📹</span>
              Original Video
            </h4>
            <div className="video-preview relative">
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Original 2D Video</p>
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span data-testid="original-specs">{video.resolution || "1920x1080"} • 30fps</span>
              <Button variant="ghost" size="sm" data-testid="button-play-original">
                <span className="mr-1">▶️</span>Play
              </Button>
            </div>
          </div>

          {/* VR 180 Preview */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <Headset className="mr-2 text-primary" />
              VR 180° Experience
            </h4>
            <div className="video-preview relative">
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Headset className="text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Stereoscopic VR View</p>
                </div>
              </div>
              <Badge 
                className="absolute top-2 right-2 bg-success text-white"
                data-testid="vr-ready-badge"
              >
                ✓ VR Ready
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span data-testid="vr-specs">3840x1920 • 30fps • Stereoscopic</span>
              <Button variant="ghost" size="sm" data-testid="button-vr-preview">
                <Headset className="mr-1 h-3 w-3" />
                VR Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            variant="secondary" 
            onClick={onRegenerate}
            data-testid="button-regenerate"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button 
            variant="outline"
            data-testid="button-preview-vr"
          >
            <Headset className="mr-2 h-4 w-4" />
            Preview in VR
          </Button>
          <Button 
            onClick={onAccept}
            className="floating-action bg-primary hover:bg-primary/90"
            data-testid="button-proceed-download"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Proceed to Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
