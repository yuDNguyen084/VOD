"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setError("");
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to login");
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black text-white">
      <div className="bg-neutral-900 p-8 rounded-xl w-80 shadow-2xl border border-white/10">
        <h1 className="text-xl font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
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
          disabled={isLoading}
          className="w-full bg-red-500 py-2 rounded hover:bg-red-600 transition disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
