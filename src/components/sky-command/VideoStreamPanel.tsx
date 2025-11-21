"use client";

import { useEffect, useState, useRef } from "react";
import { useVideoStream } from "@/context/video-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Camera, Video, Square, Download, Plus, Trash2, Clock } from "lucide-react";

export function VideoStreamPanel() {
  const {
    cameras,
    activeCamera,
    isLoading,
    error,
    loadCameras,
    switchCamera,
    addCamera,
    removeCamera,
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    downloadRecording,
  } = useVideoStream();

  const [videoSource, setVideoSource] = useState<string>("");
  const [isAddingCamera, setIsAddingCamera] = useState(false);
  const [newCameraName, setNewCameraName] = useState("");
  const [newCameraUrl, setNewCameraUrl] = useState("");
  const [selectedCameraToRemove, setSelectedCameraToRemove] = useState<string | null>(null);
  const videoRef = useRef<HTMLImageElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load cameras on mount
  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  // Set initial video source
  useEffect(() => {
    if (activeCamera) {
      setVideoSource(`/api/video/stream?camera=${activeCamera.id}&format=jpeg`);
    }
  }, [activeCamera]);

  // Poll for video frames
  useEffect(() => {
    if (!videoSource) return;

    const pollFrame = async () => {
      try {
        const response = await fetch(videoSource);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          if (videoRef.current) {
            videoRef.current.src = url;
          }
        }
      } catch (err) {
        console.error("Failed to fetch video frame:", err);
      }
    };

    // Poll every 33ms (~30fps)
    pollingRef.current = setInterval(pollFrame, 33);
    pollFrame(); // Initial frame

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [videoSource]);

  const handleSwitchCamera = async (cameraId: string) => {
    await switchCamera(cameraId);
    setVideoSource(`/api/video/stream?camera=${cameraId}&format=jpeg`);
  };

  const handleAddCamera = async () => {
    if (!newCameraName || !newCameraUrl) {
      alert("Please fill in all fields");
      return;
    }
    await addCamera(newCameraName, newCameraUrl);
    setNewCameraName("");
    setNewCameraUrl("");
    setIsAddingCamera(false);
  };

  const handleRemoveCamera = async (cameraId: string) => {
    await removeCamera(cameraId);
    setSelectedCameraToRemove(null);
  };

  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopRecording = async () => {
    try {
      const url = await stopRecording();
      const filename = `drone_video_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
      
      // Create blob and download
      const response = await fetch(url);
      const blob = await response.blob();
      downloadRecording(blob, filename);
    } catch (err) {
      alert("Failed to stop recording: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-400" />
              <div>
                <CardTitle className="text-lg">Video Stream</CardTitle>
                <CardDescription>
                  {activeCamera?.name || "No camera selected"}
                </CardDescription>
              </div>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-900/20 border border-red-600/50 rounded-full animate-pulse">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-red-400">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="relative bg-slate-950 aspect-video flex items-center justify-center border-t border-slate-700/50">
            <img
              ref={videoRef}
              src={videoSource}
              alt="Video stream"
              className="w-full h-full object-cover"
              onError={() => {
                if (videoRef.current) {
                  videoRef.current.style.display = "none";
                }
              }}
            />
            <div className="absolute bottom-4 left-4 flex gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 bg-slate-900/80 rounded">FPS: ~30</span>
              <span className="px-2 py-1 bg-slate-900/80 rounded">640x480</span>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-900/20 border-t border-red-600/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Control Bar */}
          <div className="border-t border-slate-700/50 p-4 space-y-4">
            {/* Camera Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Camera</label>
              <Select
                value={activeCamera?.id || ""}
                onValueChange={handleSwitchCamera}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {cameras.map(camera => (
                    <SelectItem key={camera.id} value={camera.id}>
                      {camera.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recording Controls */}
            <div className="flex gap-2">
              {!isRecording ? (
                <Button
                  onClick={handleStartRecording}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={handleStopRecording}
                  className="flex-1 bg-red-900 hover:bg-red-800 text-white"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>

            {/* Camera Management */}
            <div className="flex gap-2">
              <Dialog open={isAddingCamera} onOpenChange={setIsAddingCamera}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 bg-slate-800 border-slate-600 hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Camera
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle>Add New Camera</DialogTitle>
                    <DialogDescription>
                      Add a new RTSP camera to the system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Camera Name</label>
                      <Input
                        placeholder="e.g., Front Camera"
                        value={newCameraName}
                        onChange={(e) => setNewCameraName(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-slate-100 mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">RTSP URL</label>
                      <Input
                        placeholder="rtsp://192.168.1.100:8554/stream"
                        value={newCameraUrl}
                        onChange={(e) => setNewCameraUrl(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-slate-100 mt-2"
                      />
                    </div>
                    <Button
                      onClick={handleAddCamera}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Add Camera
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <AlertDialog open={!!selectedCameraToRemove} onOpenChange={(open) => {
                if (!open) setSelectedCameraToRemove(null);
              }}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 bg-slate-800 border-slate-600 hover:bg-slate-700"
                    onClick={() => {
                      if (cameras.length > 1) {
                        setSelectedCameraToRemove(activeCamera?.id || cameras[0].id);
                      }
                    }}
                    disabled={cameras.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Camera
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Camera</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this camera? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-2 justify-end">
                    <AlertDialogCancel className="bg-slate-800 border-slate-600">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (selectedCameraToRemove) {
                          handleRemoveCamera(selectedCameraToRemove);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Remove
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Camera List */}
            <div className="pt-2">
              <p className="text-xs font-medium text-slate-400 mb-2">Available Cameras ({cameras.length})</p>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {cameras.map(camera => (
                  <div
                    key={camera.id}
                    className={`p-2 rounded text-xs ${
                      camera.active
                        ? 'bg-blue-600/20 border border-blue-600/50 text-blue-300'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{camera.name}</span>
                      {camera.active && <span className="px-2 py-0.5 bg-blue-600 rounded text-xs">Active</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording Info */}
      {isRecording && (
        <Card className="bg-red-900/10 border-red-600/30">
          <CardContent className="p-4 flex items-center gap-2">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Recording in progress</p>
              <p className="text-xs text-red-400">Duration: {formatTime(recordingTime)}</p>
            </div>
            <Clock className="h-4 w-4 text-red-400" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
