"use client";

import { create } from "zustand";

type UploadState = {
  file: File | null;
  progress: number;
  isUploading: boolean;

  setFile: (file: File) => void;
  upload: () => Promise<void>;
  reset: () => void;
};

export const useUploadStore = create<UploadState>((set, get) => ({
  file: null,
  progress: 0,
  isUploading: false,

  setFile: (file) => set({ file }),

  upload: async () => {
    const { file } = get();
    if (!file) return;

    set({ isUploading: true, progress: 0 });

    // 🚀 giả lập presigned URL upload
    let percent = 0;

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        percent += 10;

        set({ progress: percent });

        if (percent >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 300);
    });

    set({ isUploading: false });
  },

  reset: () =>
    set({
      file: null,
      progress: 0,
      isUploading: false,
    }),
}));
