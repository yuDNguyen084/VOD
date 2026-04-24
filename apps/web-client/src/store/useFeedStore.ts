"use client";

import { create } from "zustand";
import { api } from "../services/api";

export type VideoItem = {
  id: string;
  src: string;
  thumb: string;
  title: string;
  creator?: {
    id: string;
    username?: string;
    avatarUrl?: string;
    email?: string;
  };
  status?: string;
};

type FeedState = {
  videos: VideoItem[];
  currentIndex: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  currentQuery?: string;

  fetchVideos: (query?: string) => Promise<void>;
  fetchMoreVideos: () => Promise<void>;
  setVideos: (videos: VideoItem[]) => void;
  next: () => void;
  prev: () => void;
  setIndex: (index: number) => void;
  getVisibleVideos: () => VideoItem[];
};

const PAGE_SIZE = 8;

const mapVideo = (v: any): VideoItem => ({
  id: v.id,
  src: v.hlsUrl?.startsWith("http")
    ? v.hlsUrl
    : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}/${v.hlsUrl}`,
  thumb: "https://images.unsplash.com/photo-1616423640778-28d1b53229b4?w=800",
  title: v.title || "Untitled Video",
  creator: v.creator,
  status: v.status,
});

export const useFeedStore = create<FeedState>((set, get) => ({
  videos: [],
  currentIndex: 0,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  currentPage: 1,
  currentQuery: undefined,

  fetchVideos: async (query?: string) => {
    set({ isLoading: true, videos: [], currentPage: 1, currentQuery: query, hasMore: true });
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: "1" });
      if (query) params.set("search", query);
      const res = await api.get(`/videos?${params}`);
      const fetched = res.data.data || [];
      const total: number = res.data.total || 0;

      const readyVideos = fetched
        .filter((v: any) => v.status === "READY" && v.hlsUrl)
        .map(mapVideo);

      set({
        videos: readyVideos,
        isLoading: false,
        currentPage: 1,
        hasMore: total > readyVideos.length,
      });
    } catch (e) {
      console.error("Failed to fetch videos", e);
      set({ isLoading: false });
    }
  },

  fetchMoreVideos: async () => {
    const { isLoadingMore, hasMore, currentPage, currentQuery, videos } = get();
    if (isLoadingMore || !hasMore) return;

    set({ isLoadingMore: true });
    try {
      const nextPage = currentPage + 1;
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(nextPage) });
      if (currentQuery) params.set("search", currentQuery);
      const res = await api.get(`/videos?${params}`);
      const fetched = res.data.data || [];
      const total: number = res.data.total || 0;

      const newVideos = fetched
        .filter((v: any) => v.status === "READY" && v.hlsUrl)
        .map(mapVideo);

      const allVideos = [...videos, ...newVideos];
      set({
        videos: allVideos,
        isLoadingMore: false,
        currentPage: nextPage,
        hasMore: total > allVideos.length,
      });
    } catch (e) {
      console.error("Failed to load more videos", e);
      set({ isLoadingMore: false });
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
