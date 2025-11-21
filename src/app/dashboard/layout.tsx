"use client";

import { VideoProvider } from '@/context/video-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VideoProvider>
      {children}
    </VideoProvider>
  );
}
