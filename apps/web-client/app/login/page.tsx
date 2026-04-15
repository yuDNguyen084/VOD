"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://static.videezy.com/system/resources/previews/000/005/067/original/Ethereal_Wave_4K_Motion_Background_Loop.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-cyan-900/30" />

      <div className="relative z-10 w-[360px] p-[1px] rounded-2xl bg-gradient-to-r from-red-500 via-cyan-400 to-purple-500">
        <div className="bg-neutral-900 rounded-2xl p-8 space-y-5">
          <h2 className="text-2xl font-bold text-center text-white">Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-black border border-neutral-700 outline-none text-sm text-white focus:border-red-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-black border border-neutral-700 outline-none text-sm text-white focus:border-red-500"
          />

          <button className="w-full py-3 rounded-md bg-red-600 hover:bg-red-500 transition text-white font-semibold">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
