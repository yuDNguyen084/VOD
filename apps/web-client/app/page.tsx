"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import VideoSection from "@/components/VideoSection";
import { colors } from "@/constants/theme";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <main
      style={{ backgroundColor: colors.bg }}
      className="text-white min-h-screen font-mono relative overflow-hidden"
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
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/dark-dot.png')",
          }}
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Categories />

        <div className="space-y-16 pb-16 px-12 mt-10">
          <VideoSection
            title="Trending"
            accent={colors.neonRed}
            onSelectVideo={() => setIsOpen(true)}
          />
          <VideoSection
            title="Recommended for You"
            accent={colors.neonCyan}
            onSelectVideo={() => setIsOpen(true)}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-[80%] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              controls
              autoPlay
              className="w-full rounded-xl shadow-2xl"
              src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
            />
          </div>
        </div>
      )}
    </main>
  );
}
