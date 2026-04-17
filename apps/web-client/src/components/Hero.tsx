"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { colors } from "@/constants/theme";

type Movie = {
  id: string;
  title: string;
  description: string;
  backdrop: string;
};

const mockMovies: Movie[] = [
  {
    id: "1",
    title: "Big Buck Bunny",
    description:
      "An open source cinematic legend with stunning visuals and adaptive HLS streaming.",
    backdrop:
      "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
  },
  {
    id: "2",
    title: "Cyber Runner",
    description:
      "A futuristic chase in neon-lit streets where speed is everything.",
    backdrop: "https://images.unsplash.com/photo-1535223289827-42f1e9919769",
  },
  {
    id: "3",
    title: "Neon City",
    description:
      "Dive into a dystopian world full of glowing lights and hidden secrets.",
    backdrop: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % mockMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const movie = mockMovies[index];

  return (
    <div className="h-screen relative flex items-end pb-24 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${movie.backdrop}')`,
            filter: "brightness(0.95) contrast(1.05)",
          }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(255,0,80,0.1),transparent_60%)]" />

      <div className="relative z-10 max-w-2xl px-12">
        <motion.div
          key={movie.id + "-content"}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 mb-3 rounded border border-cyan-500/30 bg-cyan-950/20 text-xs font-bold text-cyan-400 tracking-wider">
            STREAMING NOW
          </div>

          <h2
            className="text-7xl font-black mb-6 leading-tight"
            style={{
              textShadow: `1px 1px 0px ${colors.neonCyan}, -1px -1px 0px ${colors.neonRed}, 0 0 15px ${colors.neonRed}`,
            }}
          >
            {movie.title}
          </h2>

          <p className="text-neutral-200 mb-10 text-lg leading-relaxed max-w-xl">
            {movie.description}
          </p>

          <div className="flex gap-6">
            <CyberButton primary>▶ PLAY</CyberButton>
            <CyberButton>+ MY LIST</CyberButton>
            <CyberButton info>ℹ DETAILS</CyberButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CyberButton({
  children,
  primary,
  info,
}: {
  children: React.ReactNode;
  primary?: boolean;
  info?: boolean;
}) {
  const [hover, setHover] = useState(false);

  const accent = primary ? colors.neonRed : info ? colors.neonCyan : "#ffffff";

  const themeClass = primary
    ? "border-red-500 bg-red-950/20 text-red-100"
    : info
      ? "border-cyan-500 bg-cyan-950/20 text-cyan-100"
      : "border-neutral-500 bg-neutral-800/30 text-neutral-100";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative px-8 py-3.5 rounded-sm font-bold tracking-wider border-2 transition-all duration-300 ${themeClass}`}
      style={{
        boxShadow: hover ? `0 0 20px ${accent}` : "none",
      }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      <div className="absolute -top-[2px] -left-[2px] w-1.5 h-1.5 border-l-2 border-t-2 border-white/40" />
      <div className="absolute -bottom-[2px] -right-[2px] w-1.5 h-1.5 border-r-2 border-b-2 border-white/40" />
    </motion.button>
  );
}
