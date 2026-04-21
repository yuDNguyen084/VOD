"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleLogin = () => {
    login({
      name: email.split("@")[0] || "user",
      role: "creator",
    });

    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black text-white">
      <div className="bg-neutral-900 p-8 rounded-xl w-80 shadow-2xl border border-white/10">
        <h1 className="text-xl font-bold mb-6 text-center">Login</h1>

        <input
          className="w-full mb-3 p-2 bg-black border border-white/20 rounded focus:outline-none focus:border-red-500"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-2 bg-black border border-white/20 rounded focus:outline-none focus:border-red-500"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-red-500 py-2 rounded hover:bg-red-600 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
