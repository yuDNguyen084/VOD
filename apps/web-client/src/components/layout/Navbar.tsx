"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useFeedStore } from "@/store/useFeedStore";
import { useRouter } from "next/navigation";
import { Home, Grid, Clock, Search, User, LogOut, Upload, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

const menus = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Categories", icon: Grid, path: "/" },
  { name: "Latest", icon: Clock, path: "/" }
];

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { fetchVideos } = useFeedStore(); // For search functionality
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useSocket(); // Initialize socket connection

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Very basic client side search implementation by refetching with query
      router.push(`/?search=${searchQuery}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 h-screen w-20 hover:w-64 group z-[9999] transition-all duration-300 bg-black/90 border-r border-white/10 backdrop-blur-md flex flex-col items-center py-6">
      <div className="w-full flex justify-center mb-10">
        <h1
          onClick={() => router.push("/")}
          className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-blue-500 to-cyan-500 font-bold text-2xl cursor-pointer"
        >
          <span className="group-hover:hidden">V</span>
          <span className="hidden group-hover:inline">VOD</span>
        </h1>
      </div>

      <nav className="flex flex-col gap-6 w-full px-4 flex-1">
        {menus.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.name}
              onClick={() => router.push(m.path)}
              className="flex items-center gap-4 text-white/70 hover:text-white cursor-pointer transition-colors p-2 rounded-xl hover:bg-white/10"
            >
              <Icon size={24} className="min-w-[24px]" />
              <span className="hidden group-hover:block whitespace-nowrap">{m.name}</span>
            </div>
          );
        })}

        <div className="mt-6 flex items-center gap-4 text-white/70 bg-neutral-900 rounded-xl p-2 border border-white/10 cursor-pointer overflow-hidden">
          <Search size={24} className="min-w-[24px]" />
          <input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="hidden group-hover:block bg-transparent outline-none w-full text-sm"
          />
        </div>
      </nav>

      <div className="w-full px-4 relative flex flex-col items-center group-hover:items-start gap-4">
        {/* Auth Section */}
        <div 
          className="flex items-center gap-4 p-2 w-full rounded-xl hover:bg-white/10 cursor-pointer text-white/70 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          <User size={24} className="min-w-[24px]" />
          <span className="hidden group-hover:block whitespace-nowrap">Profile</span>
        </div>

        {open && (
          <div className="absolute bottom-14 left-4 min-w-[200px] p-[2px] rounded-xl bg-gradient-to-r from-pink-500 via-blue-500 to-cyan-500 shadow-2xl shadow-black">
            <div className="bg-black rounded-xl p-2 flex flex-col">
              {!user ? (
                <>
                  <button onClick={() => router.push("/login")} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-pink-400">
                    <LogIn size={18} /> Sign In
                  </button>
                  <button onClick={() => router.push("/register")} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-cyan-400">
                    <UserPlus size={18} /> Sign Up
                  </button>
                </>
              ) : (
                <>
                  {user.role?.toUpperCase() === 'ADMIN' && (
                    <button onClick={() => router.push("/dashboard")} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-blue-400">
                      <LayoutDashboard size={18} /> Dashboard
                    </button>
                  )}
                  <button onClick={() => router.push("/upload")} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-white">
                    <Upload size={18} /> Upload
                  </button>
                  <button onClick={logout} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-red-400">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
