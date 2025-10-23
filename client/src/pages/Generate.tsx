import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Image, Loader2, Video, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type ImageModel = "flux-schnell" | "flux-dev" | "seedream" | "nano-banana";
type VideoModel = "veo-3-fast" | "seedance-pro" | "seedance-lite" | "hailuo-02" | "sora-2" | "sora-2-pro";
type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

// Video model specifications
const VIDEO_MODEL_SPECS = {
  "veo-3-fast": {
    name: "Google Veo 3 Fast",
    durations: [8], // Veo 3 Fast only supports 8 seconds
    resolutions: [
      { name: "720p (16:9)", width: 1280, height: 720 },
      { name: "720p (9:16)", width: 720, height: 1280 },
      { name: "1080p (16:9)", width: 1920, height: 1080 },
      { name: "1080p (9:16)", width: 1080, height: 1920 },
    ],
    basePrice: 5, // credits per second
    supportsImageToVideo: true,
    supportsAudio: true,
  },
  "seedance-pro": {
    name: "Seedance Pro",
    durations: [5, 10], // Seedance Pro only supports 5 or 10 seconds
    resolutions: [
      { name: "480p (16:9)", width: 864, height: 480 },
      { name: "544p (4:3)", width: 736, height: 544 },
      { name: "640p (1:1)", width: 640, height: 640 },
      { name: "1080p (16:9)", width: 1920, height: 1088 },
      { name: "1248p (4:3)", width: 1664, height: 1248 },
      { name: "1440p (1:1)", width: 1440, height: 1440 },
    ],
    basePrice: 5,
    supportsImageToVideo: true,
    supportsAudio: false,
  },
  "seedance-lite": {
    name: "Seedance Lite",
    durations: [5, 10], // Seedance Lite only supports 5 or 10 seconds
    resolutions: [
      { name: "480p (16:9)", width: 864, height: 480 },
      { name: "544p (4:3)", width: 736, height: 544 },
      { name: "640p (1:1)", width: 640, height: 640 },
      { name: "704p (16:9)", width: 1248, height: 704 },
      { name: "832p (4:3)", width: 1120, height: 832 },
      { name: "960p (1:1)", width: 960, height: 960 },
    ],
    basePrice: 5,
    supportsImageToVideo: true,
    supportsAudio: false,
  },
  "hailuo-02": {
    name: "Hailuo Minimax 02",
    durations: [6, 10],
    resolutions: [
      { name: "768p (16:9)", width: 1366, height: 768 },
      { name: "1080p (16:9)", width: 1920, height: 1080 },
    ],
    basePrice: 5,
    supportsImageToVideo: true, // Hailuo 02 supports frameImages (first frame)
    supportsAudio: false,
  },
  "sora-2": {
    name: "OpenAI Sora 2",
    durations: [5, 10, 15, 20],
    resolutions: [
      { name: "720p (16:9)", width: 1280, height: 720 },
      { name: "720p (9:16)", width: 720, height: 1280 },
      { name: "1080p (16:9)", width: 1920, height: 1080 },
      { name: "1080p (9:16)", width: 1080, height: 1920 },
      { name: "1080p (1:1)", width: 1080, height: 1080 },
    ],
    basePrice: 5,
    supportsImageToVideo: false,
    supportsAudio: true,
  },
  "sora-2-pro": {
    name: "OpenAI Sora 2 Pro",
    durations: [5, 10, 15, 20],
    resolutions: [
      { name: "720p (16:9)", width: 1280, height: 720 },
      { name: "720p (9:16)", width: 720, height: 1280 },
      { name: "1080p (16:9)", width: 1920, height: 1080 },
      { name: "1080p (9:16)", width: 1080, height: 1920 },
      { name: "1080p (1:1)", width: 1080, height: 1080 },
      { name: "4K (16:9)", width: 3840, height: 2160 },
    ],
    basePrice: 5,
    supportsImageToVideo: false,
    supportsAudio: true,
  },
};

const ASPECT_RATIO_SIZES: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1024, height: 576 },
  "9:16": { width: 576, height: 1024 },
  "4:3": { width: 1024, height: 768 },
  "3:4": { width: 768, height: 1024 },
};

export default function Generate() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [imageModel, setImageModel] = useState<ImageModel>("flux-schnell");
  const [videoModel, setVideoModel] = useState<VideoModel>("veo-3-fast");
  const [videoDuration, setVideoDuration] = useState<number>(4);
  const [videoResolution, setVideoResolution] = useState<{width: number, height: number}>({ width: 1280, height: 720 });
  const [generateAudio, setGenerateAudio] = useState(false);
  const [videoInputImage, setVideoInputImage] = useState<File | null>(null);
  const [videoImagePreviewUrl, setVideoImagePreviewUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const { data: credits, error: creditsError, isLoading: creditsLoading } = trpc.credits.getBalance.useQuery();
  
  // Debug credits loading
  useEffect(() => {
    console.log("Credits data:", credits);
    console.log("Credits error:", creditsError);
    console.log("Credits loading:", creditsLoading);
  }, [credits, creditsError, creditsLoading]);

  // Clear input image when switching to a model that doesn't support image-to-video
  useEffect(() => {
    const modelSpec = VIDEO_MODEL_SPECS[videoModel];
    if (!modelSpec.supportsImageToVideo && videoInputImage) {
      setVideoInputImage(null);
      if (videoImagePreviewUrl) {
        URL.revokeObjectURL(videoImagePreviewUrl);
        setVideoImagePreviewUrl("");
      }
      const message = videoModel.startsWith('sora-') 
        ? `${modelSpec.name} - Upload photo not available yet. Image cleared.`
        : `${modelSpec.name} doesn't support image-to-video. Image cleared.`;
      toast.info(message);
    }
  }, [videoModel]);

  // Clear audio setting when switching to a model that doesn't support audio
  useEffect(() => {
    const modelSpec = VIDEO_MODEL_SPECS[videoModel];
    if (!modelSpec.supportsAudio && generateAudio) {
      setGenerateAudio(false);
      toast.info(`${modelSpec.name} doesn't support audio generation. Audio disabled.`);
    }
  }, [videoModel]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      if (videoImagePreviewUrl) {
        URL.revokeObjectURL(videoImagePreviewUrl);
      }
    };
  }, [imagePreviewUrls, videoImagePreviewUrl]);

  const generateImageMutation = trpc.generations.generateImage.useMutation({
    onSuccess: (data) => {
      console.log("🎉 Generation success data:", data);
      setGeneratedImage('imageUrl' in data ? data.imageUrl || "" : "");
      toast.success("Image generated successfully!");
    },
    onError: (error) => {
      console.error("❌ Generation error:", error);
      toast.error(error.message || "Failed to generate image");
    },
  });

  const [currentTaskUUID, setCurrentTaskUUID] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const generateVideoMutation = trpc.video.generate.useMutation({
    onSuccess: (data) => {
      setCurrentTaskUUID(data.taskUUID);
      setIsPolling(true);
      toast.success(`Video generation started! Estimated cost: ${data.estimatedCredits} credits`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate video");
    },
  });

  // Use conditional query for polling
  const { data: pollResult, refetch: refetchPoll } = trpc.video.poll.useQuery(
    { taskUUID: currentTaskUUID! },
    { 
      enabled: !!currentTaskUUID && isPolling,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );

  // Handle poll results
  useEffect(() => {
    if (pollResult && isPolling) {
      if (pollResult.status === "success" && pollResult.videoURL) {
        setGeneratedVideo(pollResult.videoURL);
        setCurrentTaskUUID(null);
        setIsPolling(false);
        toast.success("Video generated successfully!");
      } else if (pollResult.status === "failed") {
        setCurrentTaskUUID(null);
        setIsPolling(false);
        toast.error("Video generation failed");
      }
      // If still processing, the refetchInterval will continue polling
    }
  }, [pollResult, isPolling]);

  const handleImageGenerate = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    const size = ASPECT_RATIO_SIZES[aspectRatio];
    const isRunware = imageModel === "flux-schnell" || imageModel === "flux-dev";
    const isReplicate = imageModel === "nano-banana" || imageModel === "seedream";

    // If using replicate models and files are uploaded, upload them first
    let imageUrls: string[] | undefined;
    if (isReplicate && uploadedFiles.length > 0) {
      try {
        setIsUploading(true);
        toast.info("Uploading reference images...");
        const uploadPromises = uploadedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }
          
          const result = await response.json();
          return result.url;
        });

        imageUrls = await Promise.all(uploadPromises);
        toast.success("Reference images uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to upload images");
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const params = {
      prompt: imagePrompt,
      provider: (isRunware ? "runware" : "replicate") as "runware" | "replicate",
      model: imageModel,
      width: size.width,
      height: size.height,
      aspectRatio: aspectRatio, // Pass the aspect ratio string directly
      imageUrls, // Add uploaded image URLs for nano-banana
    };

    console.log("🚀 Starting generation with params:", params);
    generateImageMutation.mutate(params);
  };

  const handleVideoGenerate = async () => {
    if (!videoPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    let inputImageBase64: string | undefined;

    // Convert input image to base64 if provided
    if (videoInputImage) {
      try {
        inputImageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            // Remove data:image/...;base64, prefix
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(videoInputImage);
        });
      } catch (error) {
        toast.error("Failed to process input image");
        return;
      }
    }

    const modelSpec = VIDEO_MODEL_SPECS[videoModel];
    generateVideoMutation.mutate({
      model: videoModel,
      prompt: videoPrompt,
      duration: videoDuration,
      width: videoResolution.width,
      height: videoResolution.height,
      inputImage: inputImageBase64,
      generateAudio: modelSpec.supportsAudio ? generateAudio : false,
    });
  };

  // Helper function to calculate video generation cost
  const calculateVideoCost = () => {
    const spec = VIDEO_MODEL_SPECS[videoModel];
    // Cost is basePrice (credits per second) * duration in seconds
    return spec.basePrice * videoDuration;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Clean up previous preview URLs
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Create new preview URLs for the uploaded files
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      
      setUploadedFiles(files);
      setImagePreviewUrls(newPreviewUrls);
      toast.success(`${files.length} file(s) uploaded`);
    }
  };

  const handleVideoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Clean up previous preview URL
      if (videoImagePreviewUrl) {
        URL.revokeObjectURL(videoImagePreviewUrl);
      }
      
      // Create new preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setVideoInputImage(file);
      setVideoImagePreviewUrl(previewUrl);
      toast.success("Video input image uploaded");
    }
  };

  const removeVideoImage = () => {
    if (videoImagePreviewUrl) {
      URL.revokeObjectURL(videoImagePreviewUrl);
    }
    setVideoInputImage(null);
    setVideoImagePreviewUrl(null);
  };

  const removeFile = (index: number) => {
    // Revoke the URL for the removed image to free memory
    const urlToRevoke = imagePreviewUrls[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    
    setUploadedFiles(files => files.filter((_, i) => i !== index));
    setImagePreviewUrls(urls => urls.filter((_, i) => i !== index));
  };

  const showImageUpload = imageModel === "nano-banana" || imageModel === "seedream";

  const downloadImage = async (imageUrl: string, filename: string = 'generated-image.jpg') => {
    try {
      setIsDownloading(true);
      toast.info("Preparing download...");
      
      // Fetch the image from the URL
      const response = await fetch(imageUrl, {
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      // Get the image as a blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download image. Opening in new tab instead...");
      
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadVideo = async (videoUrl: string, filename: string = 'generated-video.mp4') => {
    try {
      setIsDownloading(true);
      toast.info("Preparing download...");
      
      const response = await fetch(videoUrl, {
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("Video downloaded successfully!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download video. Opening in new tab instead...");
      window.open(videoUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const getModelInfo = (model: ImageModel) => {
    switch (model) {
      case "flux-schnell":
        return { name: "FLUX.1 [schnell]", desc: "Ultra-fast generation", cost: "~1 credit" };
      case "flux-dev":
        return { name: "FLUX.1 [dev]", desc: "High quality, slower", cost: "~2 credits" };
      case "seedream":
        return { name: "Seedream 4.0", desc: "ByteDance model, supports image input", cost: "~4 credits" };
      case "nano-banana":
        return { name: "Nano Banana", desc: "Google Gemini, style transfer & fusion", cost: "~5 credits" };
    }
  };

  // Authentication removed for testing

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border">
              <span className="text-gray-700 text-lg">💰 Credits:</span>{" "}
              <span className="font-bold text-purple-600 text-xl">
                {creditsLoading ? "Loading..." : (credits?.balance ?? (creditsError ? 1000 : 0))}
              </span>
              {creditsError && <span className="text-xs text-orange-500 ml-2">(Test Mode)</span>}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/credits">Buy Credits</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="image">
              <Image className="w-4 h-4 mr-2" />
              Image Generation
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="w-4 h-4 mr-2" />
              Video Generation
            </TabsTrigger>
          </TabsList>

          {/* Image Generation Tab */}
          <TabsContent value="image" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Generate Image</CardTitle>
                  <CardDescription>
                    Create stunning images using AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-prompt">Prompt</Label>
                    <Textarea
                      id="image-prompt"
                      placeholder="Describe the image you want to create..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-model">Model</Label>
                    <Select
                      value={imageModel}
                      onValueChange={(value: ImageModel) => setImageModel(value)}
                    >
                      <SelectTrigger id="image-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flux-schnell">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{getModelInfo("flux-schnell").name}</span>
                            <span className="text-xs text-gray-500">{getModelInfo("flux-schnell").desc} - {getModelInfo("flux-schnell").cost}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="flux-dev">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{getModelInfo("flux-dev").name}</span>
                            <span className="text-xs text-gray-500">{getModelInfo("flux-dev").desc} - {getModelInfo("flux-dev").cost}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="seedream">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{getModelInfo("seedream").name}</span>
                            <span className="text-xs text-gray-500">{getModelInfo("seedream").desc} - {getModelInfo("seedream").cost}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="nano-banana">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{getModelInfo("nano-banana").name}</span>
                            <span className="text-xs text-gray-500">{getModelInfo("nano-banana").desc} - {getModelInfo("nano-banana").cost}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                    <Select
                      value={aspectRatio}
                      onValueChange={(value: AspectRatio) => setAspectRatio(value)}
                    >
                      <SelectTrigger id="aspect-ratio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Square - 1024×1024)</SelectItem>
                        <SelectItem value="16:9">16:9 (Landscape - 1024×576)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait - 576×1024)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard - 1024×768)</SelectItem>
                        <SelectItem value="3:4">3:4 (Portrait - 768×1024)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showImageUpload && (
                    <div className="space-y-2">
                      <Label htmlFor="image-upload">Reference Images (Optional)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click to upload reference images
                          </span>
                          <span className="text-xs text-gray-400">
                            {imageModel === "nano-banana" ? "For style transfer & image fusion" : "For image editing & transformation"}
                          </span>
                        </label>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-700">
                              Reference Images ({uploadedFiles.length})
                            </div>
                            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                              {imageModel === "nano-banana" ? "Style Transfer & Fusion" : "Image Editing"}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
                                  {imagePreviewUrls[index] ? (
                                    <img
                                      src={imagePreviewUrls[index]}
                                      alt={file.name}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="text-center">
                                        <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <div className="text-xs text-gray-500">Loading...</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                                <div className="mt-1 text-xs text-gray-600 truncate" title={file.name}>
                                  {file.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleImageGenerate}
                    disabled={generateImageMutation.isPending || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-pulse" />
                        Uploading images...
                      </>
                    ) : generateImageMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Image"
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    Cost: {getModelInfo(imageModel).cost} per image
                  </div>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Generated Image</CardTitle>
                  <CardDescription>Your AI-generated image will appear here</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedImage ? (
                    <div className="space-y-4">
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full rounded-lg shadow-lg"
                      />
                      <Button 
                        onClick={() => downloadImage(generatedImage, `nano-banana-${Date.now()}.jpg`)}
                        disabled={isDownloading}
                        className="w-full"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Image
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Image className="w-12 h-12 mx-auto mb-2" />
                        <p>No image generated yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Video Generation Tab */}
          <TabsContent value="video" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Generate Video</CardTitle>
                  <CardDescription>
                    Create short videos using Runware AI with 4 advanced models
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Model Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="video-model">Video Model</Label>
                    <Select 
                      value={videoModel} 
                      onValueChange={(value) => {
                        setVideoModel(value as VideoModel);
                        // Reset resolution to first available option when model changes
                        const newSpec = VIDEO_MODEL_SPECS[value as VideoModel];
                        setVideoResolution({ width: newSpec.resolutions[0].width, height: newSpec.resolutions[0].height });
                        setVideoDuration(newSpec.durations[0]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VIDEO_MODEL_SPECS).map(([key, spec]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center justify-between w-full">
                              <span>{spec.name}</span>
                              <div className="flex items-center ml-2">
                                {spec.supportsImageToVideo && (
                                  <span className="text-xs text-green-600">📷</span>
                                )}
                                {spec.supportsAudio && (
                                  <span className="text-xs text-blue-600 ml-1">�</span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="video-duration">Duration</Label>
                    <Select 
                      value={videoDuration.toString()} 
                      onValueChange={(value) => setVideoDuration(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_MODEL_SPECS[videoModel].durations.map((duration) => (
                          <SelectItem key={duration} value={duration.toString()}>
                            {duration} seconds
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resolution Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="video-resolution">Resolution</Label>
                    <Select 
                      value={`${videoResolution.width}x${videoResolution.height}`} 
                      onValueChange={(value) => {
                        const [width, height] = value.split('x').map(Number);
                        setVideoResolution({ width, height });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_MODEL_SPECS[videoModel].resolutions.map((res) => (
                          <SelectItem key={`${res.width}x${res.height}`} value={`${res.width}x${res.height}`}>
                            {res.name} ({res.width}×{res.height})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Input Image Upload (Optional) */}
                  <div className="space-y-2">
                    <Label>
                      Input Image (Optional)
                      {!VIDEO_MODEL_SPECS[videoModel].supportsImageToVideo && (
                        <span className="ml-2 text-xs text-red-500">
                          (Not supported by {VIDEO_MODEL_SPECS[videoModel].name})
                        </span>
                      )}
                    </Label>
                    <div className={`border-2 border-dashed rounded-lg p-4 ${
                      VIDEO_MODEL_SPECS[videoModel].supportsImageToVideo 
                        ? 'border-gray-300' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      {videoInputImage ? (
                        <div className="space-y-2">
                          <img
                            src={videoImagePreviewUrl!}
                            alt="Video input"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{videoInputImage.name}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={removeVideoImage}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className={`mx-auto h-12 w-12 ${
                            VIDEO_MODEL_SPECS[videoModel].supportsImageToVideo 
                              ? 'text-gray-400' 
                              : 'text-gray-300'
                          }`} />
                          <div className="mt-2">
                            {VIDEO_MODEL_SPECS[videoModel].supportsImageToVideo ? (
                              <>
                                <Label
                                  htmlFor="video-image-upload"
                                  className="cursor-pointer text-blue-600 hover:text-blue-500"
                                >
                                  Click to upload an image
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">
                                  Upload an image to animate into video (image-to-video)
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-gray-400 text-sm">
                                  {videoModel.startsWith('sora-') 
                                    ? 'Upload photo not available yet' 
                                    : 'Image-to-video not supported'
                                  }
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {videoModel.startsWith('sora-') 
                                    ? 'Text-to-video only for now' 
                                    : 'Switch to Veo 3 Fast, Seedance Pro/Lite, or Hailuo 02'
                                  }
                                </p>
                              </>
                            )}
                          </div>
                          <input
                            id="video-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleVideoImageUpload}
                            className="hidden"
                            disabled={!VIDEO_MODEL_SPECS[videoModel].supportsImageToVideo}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generate Audio Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      id="generate-audio"
                      type="checkbox"
                      checked={generateAudio}
                      onChange={(e) => setGenerateAudio(e.target.checked)}
                      disabled={!VIDEO_MODEL_SPECS[videoModel].supportsAudio}
                      className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                        !VIDEO_MODEL_SPECS[videoModel].supportsAudio 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    />
                    <Label 
                      htmlFor="generate-audio" 
                      className={`text-sm font-medium ${
                        !VIDEO_MODEL_SPECS[videoModel].supportsAudio 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      Generate Audio
                      {!VIDEO_MODEL_SPECS[videoModel].supportsAudio && (
                        <span className="ml-2 text-xs text-gray-400">
                          (Only available for Veo 3 Fast and Sora models)
                        </span>
                      )}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-prompt">Prompt</Label>
                    <Textarea
                      id="video-prompt"
                      placeholder={videoInputImage 
                        ? "Describe how you want the image to animate..."
                        : "Describe the video you want to create..."
                      }
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleVideoGenerate}
                    disabled={generateVideoMutation.isPending || isPolling}
                    className="w-full"
                  >
                    {generateVideoMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : isPolling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Video"
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    Estimated Cost: ~{calculateVideoCost()} credits
                  </div>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Generated Video</CardTitle>
                  <CardDescription>Your AI-generated video will appear here</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedVideo ? (
                    <div className="space-y-4">
                      <video
                        src={generatedVideo}
                        controls
                        className="w-full rounded-lg shadow-lg"
                      />
                      <Button 
                        onClick={() => downloadVideo(generatedVideo, `generated-video-${Date.now()}.mp4`)}
                        disabled={isDownloading}
                        className="w-full"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Video
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Video className="w-12 h-12 mx-auto mb-2" />
                        <p>No video generated yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

