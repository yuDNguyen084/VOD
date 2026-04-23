"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { api } from "@/services/api";
import { Play, Pause, RotateCcw, XCircle, Activity, HardDrive, Cpu, TerminalSquare } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

type Video = {
  id: string;
  title: string;
  status: string;
  job?: {
    id: string;
    progress: number;
    status: string;
    errorLog?: string;
  };
};

export default function AdminDashboard() {
  const [pipelineStats, setPipelineStats] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [telemetry, setTelemetry] = useState<{ ramUsageMB?: number; cpuUsage?: string }>({});
  const socket = useSocket();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for real-time logs and telemetry when a video is selected
  useEffect(() => {
    if (!socket || !selectedVideo?.job) return;

    const jobId = selectedVideo.job.id;
    const logEvent = `admin:logs:${jobId}`;
    const telemetryEvent = `admin:telemetry:${jobId}`;

    setLogs([`> Initializing live log stream for job ${jobId}...`]);
    setTelemetry({});

    socket.on(logEvent, (message: string) => {
      setLogs((prev) => [...prev.slice(-50), message]); // Keep last 50 logs
    });

    socket.on(telemetryEvent, (data: any) => {
      setTelemetry(data);
    });

    return () => {
      socket.off(logEvent);
      socket.off(telemetryEvent);
    };
  }, [socket, selectedVideo]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [pipelineRes, videosRes] = await Promise.all([
        api.get("/admin/pipeline/status"),
        api.get("/videos?limit=20"),
      ]);
      setPipelineStats(pipelineRes.data);
      setVideos(videosRes.data.data || []);
    } catch (err) {
      console.error("Failed to load admin dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = (id: string, action: string) => {
    alert(`Triggered action [${action}] on job ${id}. (Backend endpoint not implemented)`);
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center">Loading Admin Panel...</div>;

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-neutral-950 text-white p-8">
        <div className="flex items-center gap-4 mb-8">
          <Activity className="text-cyan-400" size={32} />
          <h1 className="text-3xl font-bold tracking-tight">System Monitor & Dashboard</h1>
        </div>

        {/* Global Server Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-white/5 shadow-xl flex flex-col justify-between">
            <p className="text-sm font-medium text-neutral-400 flex items-center gap-2"><HardDrive size={16}/> Total Videos</p>
            <p className="text-3xl font-bold mt-2 text-white">{videos.length}</p>
          </div>
          {pipelineStats && Object.entries(pipelineStats).map(([key, value]) => (
             <div key={key} className="p-5 rounded-2xl bg-neutral-900 border border-white/5 shadow-xl flex flex-col justify-between">
               <p className="text-sm font-medium text-neutral-400 capitalize flex items-center gap-2"><Cpu size={16}/> {key.replace(/([A-Z])/g, ' $1').trim()}</p>
               <p className="text-3xl font-bold mt-2 text-cyan-400">{String(value)}</p>
             </div>
          ))}
        </div>

        <div className="flex gap-6 h-[600px]">
          {/* Left Panel: Jobs List */}
          <div className="w-2/3 bg-neutral-900 rounded-2xl p-6 border border-white/5 shadow-2xl overflow-y-auto scrollbar-hide">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">Active & Recent Jobs</h2>

            <div className="space-y-4">
              {videos.length === 0 ? <p className="text-neutral-500 text-center py-10">No videos found in the database.</p> : videos.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVideo(v)}
                  className={`flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all border ${selectedVideo?.id === v.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-black hover:bg-neutral-800'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block font-semibold text-lg text-white">{v.title || "Untitled Video"}</span>
                      <span className="text-xs text-neutral-500 font-mono mt-1">Video ID: {v.id}</span>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      v.status === 'READY' ? 'bg-green-500/20 text-green-400' : 
                      v.status === 'FAILED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  {v.job && (
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1 bg-neutral-800 rounded-full h-2">
                        <div className="bg-cyan-400 h-2 rounded-full transition-all duration-500" style={{ width: `${v.job.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-cyan-400 w-8">{v.job.progress}%</span>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={(e) => { e.stopPropagation(); handleJobAction(v.job!.id, 'PAUSE'); }} className="p-1.5 rounded bg-neutral-800 hover:bg-yellow-500/20 text-neutral-400 hover:text-yellow-400 transition" title="Pause"><Pause size={14}/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleJobAction(v.job!.id, 'RESTART'); }} className="p-1.5 rounded bg-neutral-800 hover:bg-blue-500/20 text-neutral-400 hover:text-blue-400 transition" title="Restart"><RotateCcw size={14}/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleJobAction(v.job!.id, 'CANCEL'); }} className="p-1.5 rounded bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition" title="Cancel"><XCircle size={14}/></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Selected Job Logs & Details */}
          <div className="w-1/3 bg-black rounded-2xl p-6 border border-white/5 shadow-2xl flex flex-col font-mono relative overflow-hidden">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-cyan-400"><TerminalSquare size={20}/> Job Inspector</h2>
            
            {selectedVideo ? (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 text-sm">
                  <p className="text-neutral-400 mb-1 font-sans">Target Video</p>
                  <p className="truncate text-white font-semibold">{selectedVideo.title}</p>
                </div>

                <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <p className="text-neutral-500 mb-1 font-sans">Memory Usage</p>
                     <p className="font-bold text-green-400">{telemetry.ramUsageMB ? `${telemetry.ramUsageMB} MB` : '---'}</p>
                   </div>
                   <div>
                     <p className="text-neutral-500 mb-1 font-sans">CPU Usage</p>
                     <p className="font-bold text-yellow-400">{telemetry.cpuUsage || '---'}</p>
                   </div>
                </div>

                <div className="flex-1 bg-neutral-950 rounded-xl border border-white/5 p-4 overflow-y-auto text-[10px] text-neutral-400 leading-relaxed shadow-inner scrollbar-hide">
                  {logs.map((log, i) => (
                    <p key={i} className="mb-1">{log}</p>
                  ))}
                  {selectedVideo.status !== 'READY' && selectedVideo.status !== 'FAILED' && (
                    <p className="animate-pulse text-white mt-2">Waiting for worker telemetry...</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm font-sans">
                Select a job from the list to view live telemetry.
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
