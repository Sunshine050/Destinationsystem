// app/shared/services/rescueService.ts
// API for rescue teams (create/fetch/update etc.)

import { getAuthHeaders } from "@lib/utils";

// Define DTO types ที่ match กับ backend (infer จาก RescueController/dto)
interface CreateRescueTeamDto {
  name: string;
  location?: { latitude: number; longitude: number };
  members?: string[];  // หรือ fields อื่น ปรับตาม dto/rescue.dto
}

interface UpdateRescueTeamDto {
  name?: string;
  location?: { latitude: number; longitude: number };
  members?: string[];
}

interface UpdateRescueTeamStatusDto {
  status: string;  // เช่น 'available', 'busy'
}

// Assume RescueTeam type ใน shared/types ถ้ามี หรือ define ที่นี่
interface RescueTeam {
  id: string;
  name: string;
  status: string;
  location: { latitude: number; longitude: number };
  // เพิ่ม fields อื่น
}

export const createRescueTeam = async (data: CreateRescueTeamDto): Promise<RescueTeam> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create rescue team: ${response.statusText}`);
  return response.json();
};

export const fetchRescueTeams = async (search?: string): Promise<RescueTeam[]> => {
  const headers = getAuthHeaders();
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams`);
  if (search) url.searchParams.append('search', search);
  const response = await fetch(url.toString(), {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch rescue teams: ${response.statusText}`);
  return response.json();
};

export const fetchRescueTeamById = async (id: string): Promise<RescueTeam> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/${id}`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch rescue team: ${response.statusText}`);
  return response.json();
};

export const updateRescueTeam = async (id: string, data: UpdateRescueTeamDto): Promise<RescueTeam> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update rescue team: ${response.statusText}`);
  return response.json();
};

export const updateRescueTeamStatus = async (id: string, data: UpdateRescueTeamStatusDto): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update team status: ${response.statusText}`);
  return response.json();
};

export const fetchAvailableTeams = async (latitude: number, longitude: number, radius: number = 10): Promise<RescueTeam[]> => {
  const headers = getAuthHeaders();
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/available`);
  url.searchParams.append('latitude', latitude.toString());
  url.searchParams.append('longitude', longitude.toString());
  url.searchParams.append('radius', radius.toString());
  const response = await fetch(url.toString(), {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch available teams: ${response.statusText}`);
  return response.json();
};