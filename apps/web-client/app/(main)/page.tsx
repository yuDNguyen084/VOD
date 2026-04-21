"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import VideoSection from "@/components/feed/VideoSection";
import { colors } from "@/constants/theme";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setCurrentVideo(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  return (
    <main
      style={{ backgroundColor: colors.bg }}
      className="text-white min-h-screen font-mono relative"
    >
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <Navbar />

      <div className="relative z-0">
        <VideoSection
          onSelectVideo={(src) => {
            setCurrentVideo(src);
            setIsOpen(true);
          }}
        />
      </div>

      {isOpen && currentVideo && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center"
          onClick={() => {
            setIsOpen(false);
            setCurrentVideo(null);
          }}
        >
          <div
            className="w-[90%] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              controls
              autoPlay
              className="w-full rounded-xl shadow-2xl"
              src={currentVideo}
            />
          </div>
        </div>
      )}
    </main>
  );
}
