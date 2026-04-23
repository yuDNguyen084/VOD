"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

const menus = ["Home", "Categories", "Latest"];

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useSocket(); // Initialize socket connection

  return (
    <header className="fixed top-0 left-0 w-full z-[9999]">
      <div className="p-[1px] bg-gradient-to-r from-pink-500 via-blue-500 to-cyan-500">
        <div className="bg-black/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-6">
              <h1
                onClick={() => router.push("/")}
                className="text-red-500 font-bold text-lg cursor-pointer"
              >
                VOD
              </h1>

              <nav className="flex gap-4 text-sm">
                {menus.map((m) => (
                  <span
                    key={m}
                    className="cursor-pointer text-white/70 hover:text-white transition"
                  >
                    {m}
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3 relative">
              {/* RGB SEARCH */}
              <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-cyan-500">
                <input
                  placeholder="Search..."
                  className="px-3 py-1.5 rounded-full bg-black text-white text-sm outline-none w-56"
                />
              </div>

              <div
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center cursor-pointer"
              >
                <User size={16} />
              </div>

              {open && (
                <div className="absolute right-0 top-12 p-[2px] rounded-xl bg-gradient-to-r from-pink-500 via-blue-500 to-cyan-500">
                  <div className="bg-black rounded-xl p-2 w-40">
                    {!user ? (
                      <>
                        <button
                          onClick={() => router.push("/login")}
                          className="block w-full text-left py-1 hover:text-pink-400"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => router.push("/register")}
                          className="block w-full text-left py-1 hover:text-cyan-400"
                        >
                          Sign Up
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => router.push("/upload")}
                          className="block w-full text-left py-1"
                        >
                          Upload
                        </button>
                        <button
                          onClick={logout}
                          className="block w-full text-left py-1 text-red-400"
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
