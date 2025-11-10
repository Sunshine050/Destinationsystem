// app/shared/services/authService.ts
// API for user profile/settings
import { getAuthHeaders } from "@lib/utils";
import { NotificationSettings, SystemSettings, CommunicationSettings, ProfileSettings, EmergencySettings } from "@/shared/types";

export const fetchUserProfile = async (): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
    headers,
  });
  if (!response.ok) throw new Error("Failed to fetch user profile");
  return response.json();
};

export const saveUserSettings = async (data: Partial<any>): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
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