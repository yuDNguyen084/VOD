"use client";

import { useUploadStore } from "@/store/useUploadStore";
import { useRef } from "react";

export default function UploadBox() {
  const { file, setFile } = useUploadStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="w-full h-56 border-2 border-dashed border-red-500/40 rounded-xl flex items-center justify-center cursor-pointer hover:border-red-500 transition relative overflow-hidden"
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
        }}
      />

      {!file && (
        <p className="text-neutral-400 text-center">
          Drag & drop video here <br /> or click to upload
        </p>
      )}

      {file && (
        <div className="text-center">
          <p className="font-semibold text-white">{file.name}</p>
          <p className="text-sm text-neutral-400 mt-1">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
}
