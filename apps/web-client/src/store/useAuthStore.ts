import { create } from "zustand";
import { api } from "../services/api";

type Role = "viewer" | "creator" | "admin";

type User = {
  id: string;
  email: string;
  role: Role;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  initialize: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(window.atob(base64));
          set({
            token,
            user: { id: payload.sub, email: payload.email, role: payload.role },
          });
        } catch (error) {
          localStorage.removeItem("token");
          set({ token: null, user: null });
        }
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", accessToken);
        // Should also handle refresh token safely but for now just localStorage
        localStorage.setItem("refreshToken", refreshToken);
      }

      // decode token to get user
      const base64Url = accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      set({
        token: accessToken,
        user: { id: payload.sub, email: payload.email, role: payload.role },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true });
    try {
      await api.post("/auth/register", { email, password });
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
      set({ user: null, token: null });
    }
  },
}));
