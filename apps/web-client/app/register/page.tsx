"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Register failed");
        return;
      }

      alert("Register success 🔥");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Error register");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-neutral-900 p-8 rounded-xl w-[350px] space-y-4">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>

        <input
          placeholder="Email"
          className="w-full p-2 bg-black border border-neutral-700 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 bg-black border border-neutral-700 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-cyan-600 py-2 rounded hover:bg-cyan-500"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
