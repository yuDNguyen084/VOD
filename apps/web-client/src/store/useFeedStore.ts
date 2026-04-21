"use client";

import { create } from "zustand";

type Video = {
  id: string;
  src: string;
  thumb: string;
};

type FeedState = {
  videos: Video[];
  currentIndex: number;

  setVideos: (videos: Video[]) => void;
  next: () => void;
  prev: () => void;
  setIndex: (index: number) => void;

  getVisibleVideos: () => Video[];
};

export const useFeedStore = create<FeedState>((set, get) => ({
  videos: [],
  currentIndex: 0,

  setVideos: (videos) => set({ videos }),

  next: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.videos.length - 1),
    })),

  prev: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),

  setIndex: (index) => set({ currentIndex: index }),

  getVisibleVideos: () => {
    const { videos, currentIndex } = get();

    return videos.slice(Math.max(currentIndex - 1, 0), currentIndex + 2);
  },
}));
