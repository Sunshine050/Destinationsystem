import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("ไม่พบ access token");
  return { Authorization: `Bearer ${token}` };
};

// ... existing cn, etc.