"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

const videos = [
  {
    thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    preview:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    thumb: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    preview:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    thumb: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    preview:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    thumb: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
    preview:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    thumb: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
    preview:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    thumb: "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
    preview:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    thumb: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    preview:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    preview:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
];

export default function VideoSection({
  title,
  accent,
  onSelectVideo,
}: {
  title: string;
  accent: string;
  onSelectVideo?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="px-16 relative">
      <h3
        className="text-2xl font-black mb-6 flex items-center"
        style={{ textShadow: `0 0 10px ${accent}` }}
      >
        <span className="w-1.5 h-6 bg-red-600 mr-3" />
        {title}
      </h3>

      <button
        onClick={() => scroll("left")}
        className="absolute -left-6 top-[60%] -translate-y-1/2 z-20 
        bg-black/60 hover:bg-red-500/80 text-white px-3 py-6 rounded-md"
      >
        ◀
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute -right-6 top-[60%] -translate-y-1/2 z-20 
        bg-black/60 hover:bg-red-500/80 text-white px-3 py-6 rounded-md"
      >
        ▶
      </button>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide"
      >
        {videos.map((v, i) => (
          <VideoCard
            key={i}
            accent={accent}
            video={v}
            onClick={onSelectVideo}
          />
        ))}
      </div>
    </div>
  );
}

function VideoCard({
  accent,
  video,
  onClick,
}: {
  accent: string;
  video: { thumb: string; preview: string };
  onClick?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const vidRef = useRef<HTMLVideoElement>(null);

  const handleEnter = () => {
    setHover(true);
    if (vidRef.current) {
      vidRef.current.play().catch(() => {});
    }
  };

  const handleLeave = () => {
    setHover(false);
    if (vidRef.current) {
      vidRef.current.pause();
      vidRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative min-w-[300px] h-[170px] rounded-xl overflow-hidden group cursor-pointer"
    >
      {!hover && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${video.thumb})` }}
        />
      )}

      {hover && (
        <video
          ref={vidRef}
          src={video.preview}
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
        <span className="text-4xl" style={{ textShadow: `0 0 15px ${accent}` }}>
          ▶
        </span>
      </div>

      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              border: `2px solid ${accent}`,
              boxShadow: `0 0 20px ${accent}`,
            }}
          />
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 h-20 w-full bg-gradient-to-t from-black to-transparent" />
    </motion.div>
  );
}
