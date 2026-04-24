"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { VideoItem } from "@/store/useFeedStore";

interface Props {
  video: VideoItem;
}

export default function VideoCard({ video }: Props) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (isHovered && video.src && videoRef.current) {
      const el = videoRef.current;
      if (Hls.isSupported()) {
        const hls = new Hls({
          capLevelToPlayerSize: true,
          autoStartLoad: true,
        });
        hls.loadSource(video.src);
        hls.attachMedia(el);
        hlsRef.current = hls;
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          el.play().catch(() => {});
        });
      } else if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = video.src;
        el.play().catch(() => {});
      }
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [isHovered, video.src]);

  return (
    <div 
      className="group cursor-pointer bg-neutral-900/50 rounded-2xl overflow-hidden border border-white/5 hover:border-pink-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-pink-500/10 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/?video=${video.id}`)}
    >
      <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
        {/* Static Image (Hidden on hover) */}
        <img 
          src={video.thumb} 
          alt={video.title} 
          className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-60 group-hover:opacity-100'}`}
        />
        
        {/* Preview Video (Visible on hover) */}
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className={`absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors ${isHovered ? 'hidden' : ''}`} />
        
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play size={20} fill="white" className="text-white ml-1" />
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-white truncate mb-2 group-hover:text-pink-400 transition-colors">
            {video.title}
          </h3>
          
          {video.creator && (
            <div 
              className="flex items-center gap-2 mb-2"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/profile/${video.creator!.username || video.creator!.id}`);
              }}
            >
              {video.creator.avatarUrl ? (
                <img 
                  src={video.creator.avatarUrl} 
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10" 
                  alt={video.creator.username}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center">
                  <User size={10} className="text-white" />
                </div>
              )}
              <span className="text-xs text-white/40 hover:text-white transition-colors truncate">
                @{video.creator.username || "creator"}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <span className={`text-[10px] uppercase tracking-wider font-mono ${video.status === 'READY' ? 'text-green-500' : 'text-white/20'}`}>
            {video.status}
          </span>
          {video.status === 'READY' ? (
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          ) : (
            <div className="flex gap-1">
               <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse"></div>
               <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse delay-75"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
