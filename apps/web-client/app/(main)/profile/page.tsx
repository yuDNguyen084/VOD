"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useRouter } from "next/navigation";
import {
  Camera,
  Edit3,
  Save,
  X,
  User,
  Mail,
  Calendar,
  Video,
  Loader2,
  CheckCircle,
  Play,
} from "lucide-react";
import toast from "react-hot-toast";
import VideoCard from "@/components/common/VideoCard";

export default function MyProfilePage() {
  const authUser = useAuthStore((s) => s.user);
  const router = useRouter();

  const {
    profile,
    videos,
    isLoading,
    isUpdating,
    videosHasMore,
    videosLoading,
    fetchMyProfile,
    updateProfile,
    fetchProfileVideos,
  } = useProfileStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", bio: "", avatarUrl: "" });
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }
    fetchMyProfile();
  }, [authUser, fetchMyProfile, router]);

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
      });
      fetchProfileVideos(profile.id, true);
    }
  }, [profile?.id]);

  // Lazy load more videos
  useEffect(() => {
    if (!sentinelRef.current || !profile) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videosHasMore && !videosLoading) {
          fetchProfileVideos(profile.id);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [videosHasMore, videosLoading, profile?.id]);

  const handleSave = async () => {
    try {
      await updateProfile(form);
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white/40" size={40} />
      </div>
    );
  }

  const displayName = profile.username || profile.email?.split("@")[0];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero banner */}
      <div className="relative h-48 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-cyan-600/30 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #ec4899 0%, transparent 50%), radial-gradient(circle at 80% 50%, #06b6d4 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between mb-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full ring-4 ring-[#0a0a0a] overflow-hidden bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center shadow-2xl">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-white" />
              )}
            </div>
            {editing && (
              <button
                onClick={() => {
                  const url = prompt("Enter avatar image URL:");
                  if (url) setForm((f) => ({ ...f, avatarUrl: url }));
                }}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-400 flex items-center justify-center transition shadow-lg"
              >
                <Camera size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-3 mb-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-medium"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-90 transition text-sm font-medium disabled:opacity-60"
                >
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isUpdating ? "Saving…" : "Save"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="mb-8">
          {editing ? (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-widest mb-1 block">Username</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="your_username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-pink-500/50 transition text-sm"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs uppercase tracking-widest mb-1 block">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-pink-500/50 transition text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs uppercase tracking-widest mb-1 block">Avatar URL</label>
                <input
                  value={form.avatarUrl}
                  onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-pink-500/50 transition text-sm"
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white">@{displayName}</h1>
              {profile.bio && <p className="text-white/60 mt-1 text-sm max-w-md">{profile.bio}</p>}
              <div className="flex items-center gap-4 mt-3 text-white/40 text-xs">
                <span className="flex items-center gap-1"><Mail size={12} /> {profile.email}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 capitalize"><CheckCircle size={12} className="text-green-400" /> {profile.role.toLowerCase()}</span>
              </div>
            </>
          )}
        </div>

        {/* Videos grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Video size={18} className="text-pink-400" /> My Videos
            <span className="text-white/30 text-sm font-normal">({videos.length} shown)</span>
          </h2>

          {videos.length === 0 && !videosLoading ? (
            <div className="text-center py-16 text-white/30">
              <Video size={40} className="mx-auto mb-3 opacity-30" />
              <p>No videos yet</p>
              <button
                onClick={() => router.push("/upload")}
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-white/10 hover:border-pink-500/50 transition text-sm text-pink-400"
              >
                Upload your first video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {videos.map((v) => {
                const videoItem = {
                  id: v.id,
                  title: v.title || "Untitled",
                  src: v.hlsUrl || "",
                  thumb: "https://images.unsplash.com/photo-1616423640778-28d1b53229b4?w=800",
                  status: v.status,
                  creator: profile ? { 
                    id: profile.id, 
                    username: profile.username, 
                    avatarUrl: profile.avatarUrl 
                  } : undefined
                };
                return <VideoCard key={v.id} video={videoItem as any} />;
              })}
            </div>
          )}

          {/* Lazy-load sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {videosLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-white/40" size={24} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
