"use client";

import { useRef, useEffect, useState } from "react";

const videos = [
  {
    src: "https://videos.pexels.com/video-files/36577961/15508693_3840_2160_30fps.mp4",
    user: "kaito",
    caption: "cinematic vibes 🌙",
  },
  {
    src: "https://videos.pexels.com/video-files/36934434/15647216_3840_2160_30fps.mp4",
    user: "duy",
    caption: "night drive",
  },
  {
    src: "https://videos.pexels.com/video-files/30719015/13142215_1080_1920_60fps.mp4",
    user: "nghia",
    caption: "energy 🔥",
  },
];

export default function VideoSection({
  onSelectVideo,
}: {
  onSelectVideo?: (src: string) => void;
}) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
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
  }, []);

  return (
    <div className="relative z-0 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {videos.map((video, i) => (
        <div
          key={i}
          className="h-screen snap-start relative flex items-center justify-center z-0"
        >
          <video
            data-index={i}
            ref={(el) => (videoRefs.current[i] = el)}
            src={video.src}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onClick={() => onSelectVideo?.(video.src)}
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

          {/* user info */}
          <div className="absolute bottom-10 left-6 z-20 max-w-[80%]">
            <p className="font-bold text-lg">@{video.user}</p>
            <p className="text-sm opacity-80">{video.caption}</p>
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
