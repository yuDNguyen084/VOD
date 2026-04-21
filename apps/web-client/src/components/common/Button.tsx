"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  loading = false,
  className,
}: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={loading}
      className={clsx(
        "rounded-lg font-semibold transition flex items-center justify-center",

        // SIZE
        {
          "px-3 py-2 text-sm": size === "sm",
          "px-5 py-3 text-base": size === "md",
          "px-6 py-4 text-lg": size === "lg",
        },

        // VARIANT
        {
          "bg-red-600 hover:bg-red-700 text-white": variant === "primary",
          "bg-neutral-800 hover:bg-neutral-700 text-white":
            variant === "secondary",
          "bg-transparent border border-white/20 hover:bg-white/10 text-white":
            variant === "ghost",
        },

        loading && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {loading ? "Loading..." : children}
    </motion.button>
  );
}
