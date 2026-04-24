"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useFeedStore } from "@/store/useFeedStore";
import { useSearchParams, useRouter } from "next/navigation";
import Hls from "hls.js";
import { User } from "lucide-react";

// HLS-compatible Video Player
const HlsPlayer = React.forwardRef<HTMLVideoElement, any>(({ src, ...props }, ref) => {
  const internalRef = useRef<HTMLVideoElement | null>(null);

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
      hls = new Hls({ autoStartLoad: true, capLevelToPlayerSize: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => { if (hls) hls.destroy(); };
  }, [src]);

  return <video ref={internalRef} {...props} />;
});
HlsPlayer.displayName = "HlsPlayer";

export default function VideoSection({
  onSelectVideo,
}: {
  onSelectVideo?: (src: string) => void;
}) {
  const { videos, isLoading, isLoadingMore, hasMore, fetchVideos, fetchMoreVideos } = useFeedStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams?.get("search") || undefined;

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Initial fetch
  useEffect(() => {
    fetchVideos(search);
  }, [fetchVideos, search]);

  // Intersection observer for autoplay
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
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => { if (video) observer.observe(video); });
    return () => observer.disconnect();
  }, [videos]);

  // Sentinel for lazy loading more videos
  useEffect(() => {
    if (!sentinelRef.current) return;
    const sentinel = sentinelRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          fetchMoreVideos();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, fetchMoreVideos]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Loading videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center text-white gap-4">
        <div className="text-6xl">🎬</div>
        <p className="text-white/60">No videos found.</p>
        {search && (
          <button
            onClick={() => router.push("/")}
            className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition"
          >
            Clear search
          </button>
        )}
      </div>
    );
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
            className="w-full h-full object-contain"
            muted
            loop
            playsInline
            controls
            onClick={() => onSelectVideo?.(video.src)}
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />

          {/* video info */}
          <div className="absolute bottom-10 left-6 z-20 max-w-[75%]">
            <p className="font-bold text-lg text-white drop-shadow-md mb-1">{video.title}</p>
            {video.creator && (
              <button
                onClick={() => router.push(`/profile/${video.creator!.username || video.creator!.id}`)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition text-sm group"
              >
                {video.creator.avatarUrl ? (
                  <img
                    src={video.creator.avatarUrl}
                    alt={video.creator.username || "creator"}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-white/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center">
                    <User size={14} />
                  </div>
                )}
                <span className="group-hover:underline">
                  @{video.creator.username || video.creator.email?.split("@")[0]}
                </span>
              </button>
            )}
          </div>

          {/* right actions */}
          <div className="absolute right-6 bottom-24 flex flex-col items-center gap-6 z-20">
            <Action icon="❤️" />
            <Action icon="💬" />
            <Action icon="🔗" />
          </div>

          {/* progress bar */}
          {activeIndex === i && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/20 z-20">
              <div className="h-full bg-white animate-[progress_5s_linear]" />
            </div>
          )}
        </div>
      ))}

      {/* Lazy-load sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="h-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && videos.length > 0 && (
        <div className="h-16 flex items-center justify-center text-white/40 text-sm">
          You&apos;ve reached the end 🎉
        </div>
      )}
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
