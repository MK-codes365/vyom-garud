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
  switchCamera: (cameraId: string) => Promise<void>;
  addCamera: (name: string, rtspUrl: string) => Promise<void>;
  removeCamera: (cameraId: string) => Promise<void>;

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

  // Load cameras from API
  const loadCameras = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/video/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' }),
      });

      if (!response.ok) throw new Error('Failed to load cameras');

      const data = await response.json();
      setCameras(data.cameras);
      setActiveCamera(data.activeCamera);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cameras');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Switch active camera
  const switchCamera = useCallback(async (cameraId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/video/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch', cameraId }),
      });

      if (!response.ok) throw new Error('Failed to switch camera');

      const data = await response.json();
      setActiveCamera(data.camera);
      setCameras(prev =>
        prev.map(cam => ({
          ...cam,
          active: cam.id === cameraId,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch camera');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add new camera
  const addCamera = useCallback(async (name: string, rtspUrl: string) => {
    setError(null);
    try {
      const response = await fetch('/api/video/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', cameraName: name, rtspUrl }),
      });

      if (!response.ok) throw new Error('Failed to add camera');

      const data = await response.json();
      setCameras(prev => [...prev, data.camera]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add camera');
    }
  }, []);

  // Remove camera
  const removeCamera = useCallback(async (cameraId: string) => {
    setError(null);
    try {
      const response = await fetch('/api/video/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', cameraId }),
      });

      if (!response.ok) throw new Error('Failed to remove camera');

      setCameras(prev => prev.filter(cam => cam.id !== cameraId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove camera');
    }
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
