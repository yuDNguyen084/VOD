import { z } from "zod";

// --- Auth Schemas ---
export const RegisterSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().optional(),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

// --- User Types ---
export type Role = "USER" | "CREATOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
}

// --- Video Types ---
export type VideoStatus = "PENDING" | "UPLOADED" | "PROCESSING" | "READY" | "FAILED";

export interface Video {
  id: string;
  creatorId: string;
  title: string | null;
  rawKey: string | null;
  hlsUrl: string | null;
  status: VideoStatus;
  createdAt: Date;
}

export const UploadVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  filename: z.string().min(1, "Filename is required"),
});

export type UploadVideoRequest = z.infer<typeof UploadVideoSchema>;

export interface UploadVideoResponse {
  uploadUrl: string;
  videoId: string;
}

// --- Common ---
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
