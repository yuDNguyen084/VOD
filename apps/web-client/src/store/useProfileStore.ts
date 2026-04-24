"use client";

import { create } from "zustand";
import { api } from "../services/api";
import toast from "react-hot-toast";

export type UserProfile = {
  id: string;
  email: string;
  role: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
};

export type ProfileVideo = {
  id: string;
  title?: string;
  hlsUrl?: string;
  status: string;
  createdAt: string;
  creator?: {
    id: string;
    username?: string;
    avatarUrl?: string;
  };
};

type ProfileStore = {
  profile: UserProfile | null;
  videos: ProfileVideo[];
  isLoading: boolean;
  isUpdating: boolean;
  videosPage: number;
  videosTotal: number;
  videosHasMore: boolean;
  videosLoading: boolean;

  fetchMyProfile: () => Promise<void>;
  fetchPublicProfile: (identifier: string) => Promise<UserProfile | null>;
  updateProfile: (data: Partial<Pick<UserProfile, "username" | "bio" | "avatarUrl">>) => Promise<void>;
  fetchProfileVideos: (userId: string, reset?: boolean) => Promise<void>;
  reset: () => void;
};

const PAGE_SIZE = 8;

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  videos: [],
  isLoading: false,
  isUpdating: false,
  videosPage: 1,
  videosTotal: 0,
  videosHasMore: false,
  videosLoading: false,

  fetchMyProfile: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/users/profile");
      set({ profile: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchPublicProfile: async (identifier: string) => {
    try {
      const res = await api.get(`/users/${identifier}`);
      return res.data as UserProfile;
    } catch {
      return null;
    }
  },

  updateProfile: async (data) => {
    set({ isUpdating: true });
    try {
      const res = await api.put("/users/profile", data);
      set({ profile: res.data, isUpdating: false });
      toast.success("Profile updated!");
    } catch {
      set({ isUpdating: false });
      throw new Error("Update failed");
    }
  },

  fetchProfileVideos: async (userId: string, reset = false) => {
    const { videosPage, videos, videosLoading } = get();
    if (videosLoading) return;

    const page = reset ? 1 : videosPage;
    set({ videosLoading: true });
    try {
      const res = await api.get(`/users/${userId}/videos?page=${page}&limit=${PAGE_SIZE}`);
      const { data, total } = res.data;
      const merged = reset ? data : [...videos, ...data];
      set({
        videos: merged,
        videosTotal: total,
        videosPage: page + 1,
        videosHasMore: merged.length < total,
        videosLoading: false,
      });
    } catch {
      set({ videosLoading: false });
    }
  },

  reset: () =>
    set({
      profile: null,
      videos: [],
      videosPage: 1,
      videosTotal: 0,
      videosHasMore: false,
    }),
}));
