"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-[400px] p-8 rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/10"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Sign Up
        </h2>

        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 rounded-lg bg-black border border-white/10 text-white outline-none focus:border-red-500 transition"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-black border border-white/10 text-white outline-none focus:border-red-500 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg bg-black border border-white/10 text-white outline-none focus:border-red-500 transition"
          />

          <button
            type="submit"
            className="mt-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-sm text-neutral-400 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-red-400 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
