"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { api } from "@/services/api";

type Video = {
  id: string;
  title: string;
  status: string;
};

export default function AdminDashboard() {
  const [pipelineStats, setPipelineStats] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [pipelineRes, videosRes] = await Promise.all([
        api.get("/admin/pipeline/status"),
        api.get("/videos?limit=10"),
      ]);
      setPipelineStats(pipelineRes.data);
      setVideos(videosRes.data.data || []);
    } catch (err) {
      console.error("Failed to load admin dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Failed to delete video", err);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-10">Loading...</div>;

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-black text-white p-10">
        <h1 className="text-3xl font-bold mb-10">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="p-6 rounded-xl bg-neutral-900 border border-white/10">
            <p className="text-sm text-neutral-400">Total Videos</p>
            <p className="text-2xl font-bold mt-2">{videos.length}</p>
          </div>
          {pipelineStats && Object.entries(pipelineStats).map(([key, value]) => (
             <div key={key} className="p-6 rounded-xl bg-neutral-900 border border-white/10">
               <p className="text-sm text-neutral-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
               <p className="text-2xl font-bold mt-2">{String(value)}</p>
             </div>
          ))}
        </div>

        <div className="bg-neutral-900 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>

          <div className="space-y-3">
            {videos.length === 0 ? <p className="text-neutral-500">No videos found.</p> : videos.map((v) => (
              <div
                key={v.id}
                className="flex justify-between items-center bg-black p-4 rounded-lg"
              >
                <div>
                  <span className="block font-medium">{v.title || "Untitled Video"}</span>
                  <span className="text-xs text-neutral-500">ID: {v.id} - Status: {v.status}</span>
                </div>
                <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:underline">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
