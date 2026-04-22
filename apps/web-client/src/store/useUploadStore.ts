"use client";

import { create } from "zustand";
import { api } from "../services/api";
import axios from "axios";

type UploadState = {
  file: File | null;
  title: string;
  progress: number;
  isUploading: boolean;
  error: string | null;
  videoId: string | null;

  setFile: (file: File | null) => void;
  setTitle: (title: string) => void;
  upload: () => Promise<void>;
  reset: () => void;
};

export const useUploadStore = create<UploadState>((set, get) => ({
  file: null,
  title: "",
  progress: 0,
  isUploading: false,
  error: null,
  videoId: null,

  setFile: (file) => set({ file }),
  setTitle: (title) => set({ title }),

  upload: async () => {
    const { file, title } = get();
    if (!file) return;

    // Use filename as title if title is empty
    const finalTitle = title.trim() || file.name.replace(/\.[^/.]+$/, "");

    set({ isUploading: true, progress: 0, error: null });

    try {
      // 1. Get presigned URL from our backend
      const { data } = await api.post("/videos/upload", {
        title: finalTitle,
        filename: file.name,
      });

      const { uploadUrl, videoId } = data;
      set({ videoId });

      // 2. Upload file directly to S3 using the presigned URL
      // We use axios directly here because we don't want to attach our JWT to S3
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type, // S3 usually requires Content-Type to be set correctly
        },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          set({ progress: percent });
        },
      });

      // 3. Confirm upload with our backend
      await api.post(`/videos/${videoId}/confirm`);
      set({ isUploading: false });

    } catch (error: any) {
      console.error("Upload failed", error);
      set({ error: error.response?.data?.message || error.message || "Failed to upload video", isUploading: false });
    }
  },

  reset: () =>
    set({
      file: null,
      title: "",
      progress: 0,
      isUploading: false,
      error: null,
      videoId: null,
    }),
}));
