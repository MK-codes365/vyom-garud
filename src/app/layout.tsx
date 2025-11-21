import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'VyomGarud - Cloud-based Drone Control System',
  description: 'Enterprise-grade drone control with real-time telemetry, AI-powered flight optimization, mission planning, and advanced monitoring.',
  icons: {
    icon: '/vyomgarud-logo.svg',
  },
  metadataBase: new URL('https://vyomgarud.vercel.app'),
  openGraph: {
    title: 'VyomGarud - Cloud-based Drone Control System',
    description: 'Enterprise-grade drone control with real-time telemetry and AI optimization',
    url: 'https://vyomgarud.vercel.app',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
