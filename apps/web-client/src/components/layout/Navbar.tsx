"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useFeedStore } from "@/store/useFeedStore";
import { useRouter } from "next/navigation";
import {
  Home,
  Grid,
  Clock,
  Search,
  User,
  LogOut,
  Upload,
  LayoutDashboard,
  LogIn,
  UserPlus,
  X,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { api } from "@/services/api";

const menus = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Categories", icon: Grid, path: "/" },
  { name: "Latest", icon: Clock, path: "/" },
];

type UserResult = {
  id: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  role: string;
};

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useSocket();

  // Live user search as you type
  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) {
      setUserResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}&limit=5`);
      setUserResults(res.data.data || []);
      setShowDropdown(true);
    } catch {
      setUserResults([]);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchUsers(val), 300);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 h-screen w-20 hover:w-64 group z-[9999] transition-all duration-300 bg-black/90 border-r border-white/10 backdrop-blur-md flex flex-col items-center py-6">
      {/* Logo */}
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

        {/* Search box */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-4 text-white/70 bg-neutral-900 rounded-xl p-2 border border-white/10 cursor-pointer overflow-hidden">
            <Search size={24} className="min-w-[24px]" />
            <input
              placeholder="Search videos or @users..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchSubmit}
              className="hidden group-hover:block bg-transparent outline-none w-full text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setUserResults([]); setShowDropdown(false); }}
                className="hidden group-hover:flex text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* User search results dropdown */}
          {showDropdown && userResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              <p className="text-white/40 text-xs px-3 py-2 border-b border-white/10">Users</p>
              {userResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    router.push(`/profile/${u.username || u.id}`);
                    setShowDropdown(false);
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/10 transition text-left"
                >
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      @{u.username || u.email?.split("@")[0]}
                    </p>
                    <p className="text-white/40 text-xs truncate">{u.role}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={() => { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setShowDropdown(false); }}
                className="w-full px-3 py-2 text-xs text-pink-400 hover:bg-white/10 transition text-left border-t border-white/10"
              >
                Search videos for &quot;{searchQuery}&quot; →
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Profile section */}
      <div className="w-full px-4 relative flex flex-col items-center group-hover:items-start gap-4">
        <div
          className="flex items-center gap-4 p-2 w-full rounded-xl hover:bg-white/10 cursor-pointer text-white/70 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {user ? (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-white" />
            </div>
          ) : (
            <User size={24} className="min-w-[24px]" />
          )}
          <span className="hidden group-hover:block whitespace-nowrap truncate text-sm">
            {user ? (user as any).username || user.email : "Profile"}
          </span>
        </div>

        {open && (
          <div className="absolute bottom-14 left-4 min-w-[200px] p-[2px] rounded-xl bg-gradient-to-r from-pink-500 via-blue-500 to-cyan-500 shadow-2xl shadow-black">
            <div className="bg-black rounded-xl p-2 flex flex-col">
              {!user ? (
                <>
                  <button onClick={() => { router.push("/login"); setOpen(false); }} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-pink-400">
                    <LogIn size={18} /> Sign In
                  </button>
                  <button onClick={() => { router.push("/register"); setOpen(false); }} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-cyan-400">
                    <UserPlus size={18} /> Sign Up
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { router.push("/profile"); setOpen(false); }} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-white">
                    <User size={18} /> My Profile
                  </button>
                  {user.role?.toUpperCase() === "ADMIN" && (
                    <button onClick={() => { router.push("/dashboard"); setOpen(false); }} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-blue-400">
                      <LayoutDashboard size={18} /> Dashboard
                    </button>
                  )}
                  {(user.role?.toUpperCase() === "CREATOR" || user.role?.toUpperCase() === "ADMIN") && (
                    <button onClick={() => { router.push("/upload"); setOpen(false); }} className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-white">
                      <Upload size={18} /> Upload
                    </button>
                  )}
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
