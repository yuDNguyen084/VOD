"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UploadBox from "@/components/upload/UploadBox";
import ProgressBar from "@/components/upload/ProgressBar";
import Button from "@/components/common/Button";
import { useUploadStore } from "@/store/useUploadStore";

export default function UploadPage() {
  const { file, title, setTitle, progress, isUploading, error, videoId, upload, reset } = useUploadStore();

  return (
    <ProtectedRoute requiredRole="creator">
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl space-y-6">
          <h1 className="text-3xl font-bold text-center tracking-tight">
            Upload Video
          </h1>

          {!file && (
            <p className="text-center text-white/40 text-sm">
              Drag & drop video or click to select
            </p>
          )}

          <UploadBox />

          {file && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-sm text-white/60 truncate">{file.name}</div>
              
              <input
                type="text"
                placeholder="Video Title (Optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                className="w-full p-3 rounded-lg bg-neutral-900 border border-white/20 text-white outline-none focus:border-red-500 transition"
              />

              <ProgressBar progress={progress} />

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {videoId && !isUploading && !error && <p className="text-green-500 text-sm">Upload complete!</p>}

              <div className="flex gap-3">
                <Button
                  onClick={upload}
                  loading={isUploading}
                  disabled={isUploading || !!videoId}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={reset}
                  disabled={isUploading}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
