"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  active: boolean;
}

export interface VideoContextType {
  // Camera state
  cameras: Camera[];
  activeCamera: Camera | null;
  isLoading: boolean;
  error: string | null;

  // Camera operations
  loadCameras: () => Promise<void>;
  switchCamera: (cameraId: string) => void;
  addCamera: (name: string, rtspUrl: string) => void;
  removeCamera: (cameraId: string) => void;

  // Recording state
  isRecording: boolean;
  recordedChunks: Blob[];
  recordingTime: number;

  // Recording operations
  startRecording: () => void;
  stopRecording: () => Promise<string>; // Returns download URL
  downloadRecording: (blob: Blob, filename: string) => void;

  // Stream reference for recording
  streamRef: React.MutableRefObject<MediaStream | null>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  // Camera state
  const [cameras, setCameras] = useState<Camera[]>([
    { id: 'main', name: 'Main Camera', rtspUrl: 'rtsp://localhost:8554/main', active: true },
    { id: 'thermal', name: 'Thermal Camera', rtspUrl: 'rtsp://localhost:8554/thermal', active: false },
  ]);
  const [activeCamera, setActiveCamera] = useState<Camera | null>(cameras[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);

  // Refs
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load cameras from API (or use defaults)
  const loadCameras = useCallback(async () => {
    setIsLoading(false);
    setError(null);
    // Cameras are already initialized in state, no API call needed
    // Return the current cameras
  }, []);

  // Switch active camera
  const switchCamera = useCallback(async (cameraId: string) => {
    setIsLoading(false);
    setError(null);
    // Find the camera and switch it
    const camera = cameras.find(cam => cam.id === cameraId);
    if (camera) {
      setActiveCamera(camera);
      setCameras(prev =>
        prev.map(cam => ({
          ...cam,
          active: cam.id === cameraId,
        }))
      );
    }
  }, [cameras]);

  // Add new camera
  const addCamera = useCallback((name: string, rtspUrl: string) => {
    setError(null);
    const newCamera: Camera = {
      id: `camera_${Date.now()}`,
      name: name,
      rtspUrl: rtspUrl,
      active: false,
    };
    setCameras(prev => [...prev, newCamera]);
  }, []);

  // Remove camera
  const removeCamera = useCallback((cameraId: string) => {
    setError(null);
    setCameras(prev => prev.filter(cam => cam.id !== cameraId));
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    setRecordedChunks([]);
    setRecordingTime(0);
    setIsRecording(true);

    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, []);

  // Stop recording and return download URL
  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          resolve(url);
        };

        mediaRecorderRef.current.onerror = (event) => {
          reject(new Error(`Recording error: ${event.error}`));
        };
      } else {
        reject(new Error('No recording in progress'));
      }

      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    });
  }, [recordedChunks]);

  // Download recording
  const downloadRecording = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `video_${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <VideoContext.Provider
      value={{
        cameras,
        activeCamera,
        isLoading,
        error,
        loadCameras,
        switchCamera,
        addCamera,
        removeCamera,
        isRecording,
        recordedChunks,
        recordingTime,
        startRecording,
        stopRecording,
        downloadRecording,
        streamRef,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideoStream() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoStream must be used within VideoProvider');
  }
  return context;
}
