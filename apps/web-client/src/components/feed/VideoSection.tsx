"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFeedStore } from "@/store/useFeedStore";
import { useSearchParams } from "next/navigation";
import Hls from "hls.js";

// HLS-compatible Video Player
const HlsPlayer = React.forwardRef<HTMLVideoElement, any>(({ src, ...props }, ref) => {
  const internalRef = useRef<HTMLVideoElement | null>(null);

  // Sync the forwarded ref
  useEffect(() => {
    if (typeof ref === "function") {
      ref(internalRef.current);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLVideoElement | null>).current = internalRef.current;
    }
  }, [ref]);

  useEffect(() => {
    const video = internalRef.current;
    if (!video || !src) return;

    let hls: Hls;
    if (Hls.isSupported()) {
      hls = new Hls({
        autoStartLoad: true,
        capLevelToPlayerSize: true, // Auto-adapt ABR to screen resolution
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return <video ref={internalRef} {...props} />;
});
HlsPlayer.displayName = "HlsPlayer";

export default function VideoSection({
  onSelectVideo,
}: {
  onSelectVideo?: (src: string) => void;
}) {
  const { videos, isLoading, fetchVideos } = useFeedStore();
  const searchParams = useSearchParams();
  const search = searchParams?.get("search") || undefined;
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchVideos(search);
  }, [fetchVideos, search]);

  useEffect(() => {
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const index = Number(video.dataset.index);

          if (entry.isIntersecting) {
            setActiveIndex(index);
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { threshold: 0.7 },
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [videos]);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center text-white">Loading videos...</div>;
  }

  if (videos.length === 0) {
    return <div className="h-screen w-full flex items-center justify-center text-white">No videos found.</div>;
  }

  return (
    <div className="relative z-0 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {videos.map((video, i) => (
        <div
          key={video.id}
          className="h-screen snap-start relative flex items-center justify-center z-0 bg-black"
        >
          <HlsPlayer
            data-index={i}
            ref={(el: HTMLVideoElement | null) => { videoRefs.current[i] = el; }}
            src={video.src}
            // object-contain ensures the player adapts to the screen resolution without cropping
            className="w-full h-full object-contain"
            muted
            loop
            playsInline
            controls
            onClick={() => onSelectVideo?.(video.src)}
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />

          {/* user info */}
          <div className="absolute bottom-10 left-6 z-20 max-w-[80%] pointer-events-none">
            <p className="font-bold text-lg text-white drop-shadow-md">{video.title}</p>
          </div>

          {/* right actions */}
          <div className="absolute right-6 bottom-24 flex flex-col items-center gap-6 z-20">
            <Action icon="❤️" />
            <Action icon="💬" />
            <Action icon="🔗" />
          </div>

          {/* progress */}
          {activeIndex === i && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/20 z-20">
              <div className="h-full bg-white animate-[progress_5s_linear]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Action({ icon }: { icon: string }) {
  const [liked, setLiked] = useState(false);

  return (
    <button
      onClick={() => setLiked(!liked)}
      className="text-2xl transition transform hover:scale-125 active:scale-95"
    >
      <span className={liked ? "text-red-500" : "text-white"}>{icon}</span>
    </button>
  );
}
