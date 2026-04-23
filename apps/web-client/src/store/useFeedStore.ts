"use client";

import { create } from "zustand";
import { api } from "../services/api";

type VideoItem = {
  id: string;
  src: string;
  thumb: string;
  title: string;
};

type FeedState = {
  videos: VideoItem[];
  currentIndex: number;
  isLoading: boolean;

  fetchVideos: (query?: string) => Promise<void>;
  setVideos: (videos: VideoItem[]) => void;
  next: () => void;
  prev: () => void;
  setIndex: (index: number) => void;

  getVisibleVideos: () => VideoItem[];
};

export const useFeedStore = create<FeedState>((set, get) => ({
  videos: [],
  currentIndex: 0,
  isLoading: false,

  fetchVideos: async (query?: string) => {
    set({ isLoading: true });
    try {
      // Assuming GET /videos returns { data: [...], total }
      // Filter by READY status if supported, otherwise filter client side
      const url = query ? `/videos?search=${encodeURIComponent(query)}` : "/videos";
      const res = await api.get(url);
      const fetched = res.data.data || [];
      
      const readyVideos = fetched
        .filter((v: any) => v.status === "READY" && v.hlsUrl)
        .map((v: any) => ({
          id: v.id,
          // If hlsUrl is a full URL, use it, else prepend Cloudfront path
          src: v.hlsUrl.startsWith("http") ? v.hlsUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/${v.hlsUrl}`,
          thumb: "https://images.unsplash.com/photo-1616423640778-28d1b53229b4?w=800", // placeholder
          title: v.title || "Untitled Video",
        }));

      set({ videos: readyVideos, isLoading: false });
    } catch (e) {
      console.error("Failed to fetch videos", e);
      set({ isLoading: false });
    }
  },

  setVideos: (videos) => set({ videos }),

  next: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, Math.max(state.videos.length - 1, 0)),
    })),

  prev: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),

  setIndex: (index) => set({ currentIndex: index }),

  getVisibleVideos: () => {
    const { videos, currentIndex } = get();
    if (!videos || !videos.length) return [];
    return videos.slice(Math.max(currentIndex - 1, 0), currentIndex + 2);
  },
}));
