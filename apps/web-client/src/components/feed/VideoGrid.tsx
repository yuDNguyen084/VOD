"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFeedStore } from "@/store/useFeedStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import VideoCard from "@/components/common/VideoCard";

interface Props {
  query?: string;
  username?: string;
}

export default function VideoGrid({ query, username }: Props) {
  const { videos, isLoading, isLoadingMore, hasMore, fetchVideos, fetchMoreVideos } = useFeedStore();
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideos(query);
  }, [query, username, fetchVideos]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          fetchMoreVideos();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, fetchMoreVideos]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-pink-500" size={40} />
        <p className="text-white/40 font-medium">Searching for videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/40">
        <div className="text-6xl">🔍</div>
        <p>No videos found for &quot;{query || username}&quot;</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-10">
        {isLoadingMore && <Loader2 className="animate-spin text-pink-500" size={32} />}
        {!hasMore && videos.length > 0 && (
          <p className="text-white/20 text-sm">You&apos;ve reached the end of the results</p>
        )}
      </div>
    </div>
  );
}
