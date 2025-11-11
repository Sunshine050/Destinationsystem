// app/shared/services/authService.ts
// API for user profile/settings and auth

import { getAuthHeaders } from "@lib/utils";
import { HospitalSettings } from "@/shared/types";

// Define DTO types ที่ match กับ backend DTO (จาก auth.dto.ts)
enum UserRole {
  PATIENT = 'PATIENT',
  EMERGENCY_CENTER = 'EMERGENCY_CENTER',
  HOSPITAL = 'HOSPITAL',
  RESCUE_TEAM = 'RESCUE_TEAM',
  ADMIN = 'ADMIN',
}

interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;  // optional
  role?: UserRole;  // optional, enum
}

interface LoginDto {
  email: string;
  password: string;
}

interface OAuthLoginDto {
  provider: string;  // 'google', 'facebook', 'apple'
  redirectUrl?: string;  // optional
}

interface RefreshTokenDto {
  refreshToken: string;
}

// Functions เดิม (ปรับ path ให้ match backend)
export const fetchUserProfile = async (): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers,
  });
  if (!response.ok) throw new Error("Failed to fetch user profile");
  return response.json();
};

export const saveUserSettings = async (data: Partial<any>): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {  // สมมติ backend มี PUT ที่นี่ ถ้าไม่มีต้องเพิ่มใน controller
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to save settings");
};

export const saveHospitalSettings = async (data: HospitalSettings): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospital/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to save hospital settings");
};

// Functions ใหม่สำหรับ auth APIs
export const registerUser = async (data: RegisterDto): Promise<any> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to register");
  return response.json();
};

export const loginUser = async (data: LoginDto): Promise<any> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to login");
  const result = await response.json();
  // ตัวอย่าง: เก็บ token ใน localStorage (ปรับตาม app logic)
  // localStorage.setItem('access_token', result.access_token);
  // localStorage.setItem('refresh_token', result.refresh_token);
  return result;
};

export const refreshToken = async (refreshToken: string): Promise<any> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) throw new Error("Failed to refresh token");
  return response.json();
};

export const initiateOAuth = async (data: OAuthLoginDto): Promise<string> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/oauth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to initiate OAuth");
  const { url } = await response.json();
  return url;  // ใช้ใน component: window.location.href = url;
};

export const verifyToken = async (): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-token`, {
    headers,
  });
  if (!response.ok) throw new Error("Failed to verify token");
  return response.json();
};

export const supabaseLogin = async (access_token: string): Promise<any> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/supabase-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token }),
  });
  if (!response.ok) throw new Error("Failed to login with Supabase");
  return response.json();
};