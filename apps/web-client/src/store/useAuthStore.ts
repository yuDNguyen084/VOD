import { create } from "zustand";

type User = {
  name: string;
  role: "viewer" | "creator" | "admin";
};

type AuthStore = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
