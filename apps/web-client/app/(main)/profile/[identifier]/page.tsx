"use client";

import { useEffect, useRef, useState } from "react";
import { useProfileStore, UserProfile, ProfileVideo } from "@/store/useProfileStore";
import { useRouter, useParams } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  Video,
  Loader2,
  CheckCircle,
  Play,
  ArrowLeft,
} from "lucide-react";
import VideoCard from "@/components/common/VideoCard";

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams<{ identifier: string }>();
  const identifier = params?.identifier || "";

  const { fetchPublicProfile, fetchProfileVideos, videos, videosHasMore, videosLoading, reset } =
    useProfileStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reset();
    setLoading(true);
    fetchPublicProfile(identifier).then((p) => {
      setProfile(p);
      if (p) fetchProfileVideos(p.id, true);
      setLoading(false);
    });
  }, [identifier]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white/40" size={40} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4">
        <div className="text-6xl">👤</div>
        <p className="text-white/60">User not found</p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
        >
          <ArrowLeft size={16} /> Back to feed
        </button>
      </div>
    );
  }

  const displayName = profile.username || profile.email?.split("@")[0];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="relative h-48 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-cyan-600/30 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 70% 50%, #06b6d4 0%, transparent 50%)",
          }}
        />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center gap-2 text-white/70 hover:text-white transition text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        {/* Avatar */}
        <div className="mb-6">
          <div className="w-28 h-28 rounded-full ring-4 ring-[#0a0a0a] overflow-hidden bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-2xl">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-white" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">@{displayName}</h1>
          {profile.bio && <p className="text-white/60 mt-1 text-sm max-w-md">{profile.bio}</p>}
          <div className="flex items-center gap-4 mt-3 text-white/40 text-xs flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> Joined {new Date(profile.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 capitalize">
              <CheckCircle size={12} className="text-green-400" /> {profile.role.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Videos */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Video size={18} className="text-purple-400" />
            Videos
            <span className="text-white/30 text-sm font-normal">({videos.length} shown)</span>
          </h2>

          {videos.length === 0 && !videosLoading ? (
            <div className="text-center py-16 text-white/30">
              <Video size={40} className="mx-auto mb-3 opacity-30" />
              <p>No videos yet</p>
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

          <div ref={sentinelRef} className="h-4" />

          {videosLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-white/40" size={24} />
            </div>
          )}

          {!videosHasMore && videos.length > 0 && (
            <p className="text-center text-white/30 text-sm py-4">All videos loaded</p>
          )}
        </div>
      </div>
    </main>
  );
}
