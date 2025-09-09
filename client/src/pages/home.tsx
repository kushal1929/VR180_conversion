import { useState } from "react";
import { ArrowRight, Headset, Upload, Eye, Download, Menu, Github, Twitter, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import ProcessingProgress from "@/components/processing-progress";
import VideoPreview from "@/components/video-preview";
import DownloadResults from "@/components/download-results";
import type { Video } from "@shared/schema";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "preview" | "download">("upload");
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleVideoUploaded = (video: Video) => {
    setCurrentVideo(video);
    setCurrentStep("processing");
  };

  const handleProcessingComplete = () => {
    setCurrentStep("preview");
  };

  const handlePreviewAccepted = () => {
    setCurrentStep("download");
  };

  const handleStartOver = () => {
    setCurrentVideo(null);
    setCurrentStep("upload");
  };

  const steps = [
    { id: "upload", label: "Upload", icon: Upload, completed: currentStep !== "upload" },
    { id: "processing", label: "AI Process", icon: Headset, completed: ["preview", "download"].includes(currentStep) },
    { id: "preview", label: "Preview", icon: Eye, completed: currentStep === "download" },
    { id: "download", label: "Download", icon: Download, completed: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Headset className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold">VR180 Converter</h1>
                <p className="text-xs text-muted-foreground">2D to Immersive VR</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Examples</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</a>
              <Button data-testid="button-sign-in">Sign In</Button>
            </nav>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              data-testid="button-mobile-menu"
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            Transform 2D Videos into Immersive VR 180°
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your 2D video clip and watch our AI-powered technology convert it into a stunning VR 180° experience. Perfect for VR headsets and immersive viewing.
          </p>
          
          {/* Process Steps */}
          <div className="flex justify-center items-center space-x-8 mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  step.completed || currentStep === step.id
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${
                  step.completed || currentStep === step.id
                    ? "text-foreground" 
                    : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-full w-8 h-0.5 ${
                    step.completed ? "bg-primary" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {currentStep === "upload" && (
          <FileUpload onVideoUploaded={handleVideoUploaded} />
        )}
        
        {currentStep === "processing" && currentVideo && (
          <ProcessingProgress 
            video={currentVideo} 
            onComplete={handleProcessingComplete}
          />
        )}
        
        {currentStep === "preview" && currentVideo && (
          <VideoPreview 
            video={currentVideo} 
            onAccept={handlePreviewAccepted}
            onRegenerate={() => setCurrentStep("processing")}
          />
        )}
        
        {currentStep === "download" && currentVideo && (
          <DownloadResults 
            video={currentVideo}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Headset className="text-primary-foreground w-4 h-4" />
                </div>
                <span className="font-bold">VR180 Converter</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Transform your 2D videos into immersive VR experiences with our AI-powered technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 VR180 Converter. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
