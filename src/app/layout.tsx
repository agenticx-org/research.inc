/* eslint-disable @next/next/no-sync-scripts */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WebSocketProvider } from "@/components/providers/WebSocketProvider";
import { ToasterProvider } from "@/components/providers/ToasterProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// WebSocket URL from environment
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/ws/chat";

export const metadata: Metadata = {
  title: "Research.inc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {process.env.REACT_SCAN === "TRUE" && (
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
      </head>
      <body className="antialiased">
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
