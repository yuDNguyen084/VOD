"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { colors } from "@/constants/theme";
import { User } from "lucide-react";

export default function Navbar() {
  const menuItems = ["Home", "Movies", "TV Shows", "Trending", "New & Popular"];
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full flex justify-between items-center px-10 py-5 bg-black/80 backdrop-blur-2xl border-b border-red-500/20 z-50"
    >
      <h1
        className="text-3xl font-black text-red-600 tracking-tighter"
        style={{ textShadow: `0 0 10px ${colors.neonRed}` }}
      >
        VOD
      </h1>

      <div className="flex gap-10 items-center">
        {menuItems.map((item, i) => (
          <NavItem key={item} delay={0.2 + i * 0.05}>
            {item}
          </NavItem>
        ))}
      </div>

      <div className="flex items-center gap-6 relative">
        <div className="p-[1px] rounded-full bg-gradient-to-r from-red-500 via-cyan-400 to-purple-500">
          <input
            placeholder="Search..."
            className="px-5 py-2 rounded-full bg-black outline-none text-sm w-[200px]"
          />
        </div>

        <div
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-neutral-800 border-2 border-red-500/30 flex items-center justify-center cursor-pointer hover:border-red-500 transition"
        >
          <User size={18} className="text-neutral-300" />
        </div>

        {open && (
          <div className="absolute right-0 top-16 w-44 p-[1px] rounded-xl bg-gradient-to-r from-red-500 via-cyan-400 to-purple-500">
            <div className="bg-neutral-900 rounded-xl p-3 space-y-3">
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full py-2 rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 transition"
              >
                Sign In
              </button>

              <button
                onClick={() => (window.location.href = "/register")}
                className="w-full py-2 rounded-md border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
}

function NavItem({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="relative cursor-pointer text-sm font-medium tracking-wide"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`${
          isHovered ? "text-red-400" : "text-neutral-300"
        } transition-colors duration-200`}
      >
        {children}
      </span>

      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-600 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        style={{ boxShadow: `0 0 8px ${colors.neonRed}` }}
      />
    </motion.div>
  );
}
