// // app/shared/services/rescueService.ts
// // API client สำหรับ Rescue Teams

// import { getAuthHeaders } from "@lib/utils";
// import type { RescueTeam } from "@/shared/types";

// // DTO สำหรับส่งข้อมูลไป backend
// export interface CreateRescueTeamDto {
//   name: string;
//   location: {
//     address: string;
//     coordinates: { lat: number; lng: number };
//   };
//   members: number; // จำนวนสมาชิกทีม
//   contact: string;
//   vehicle: string;
// }

// export interface UpdateRescueTeamDto {
//   name?: string;
//   location?: {
//     address?: string;
//     coordinates?: { lat: number; lng: number };
//   };
//   members?: number;
//   contact?: string;
//   vehicle?: string;
// }

// export interface UpdateRescueTeamStatusDto {
//   status: "available" | "on-mission" | "standby" | "offline";
//   activeMission?: string;
//   notes?: string;
// }

// // ฟังก์ชันเรียก API

// export const createRescueTeam = async (data: CreateRescueTeamDto): Promise<RescueTeam> => {
//   const headers = getAuthHeaders();
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...headers },
//     body: JSON.stringify(data),
//   });
//   if (!response.ok) throw new Error(`Failed to create rescue team: ${response.statusText}`);
//   return response.json();
// };

// export const fetchRescueTeams = async (search?: string): Promise<RescueTeam[]> => {
//   const headers = getAuthHeaders();
//   const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams`);
//   if (search) url.searchParams.append("search", search);
//   const response = await fetch(url.toString(), { headers });
//   if (!response.ok) throw new Error(`Failed to fetch rescue teams: ${response.statusText}`);
//   return response.json();
// };

// export const fetchRescueTeamById = async (id: string): Promise<RescueTeam> => {
//   const headers = getAuthHeaders();
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/${id}`, { headers });
//   if (!response.ok) throw new Error(`Failed to fetch rescue team: ${response.statusText}`);
//   return response.json();
// };

// export const updateRescueTeam = async (
//   id: string,
//   data: UpdateRescueTeamDto
// ): Promise<RescueTeam> => {
//   const headers = getAuthHeaders();
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/${id}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json", ...headers },
//     body: JSON.stringify(data),
//   });
//   if (!response.ok) throw new Error(`Failed to update rescue team: ${response.statusText}`);
//   return response.json();
// };

// export const updateRescueTeamStatus = async (
//   id: string,
//   data: UpdateRescueTeamStatusDto
// ): Promise<RescueTeam> => {
//   const headers = getAuthHeaders();
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/${id}/status`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json", ...headers },
//     body: JSON.stringify(data),
//   });
//   if (!response.ok) throw new Error(`Failed to update team status: ${response.statusText}`);
//   return response.json();
// };

// export const fetchAvailableTeams = async (
//   latitude: number,
//   longitude: number,
//   radius: number = 10
// ): Promise<RescueTeam[]> => {
//   const headers = getAuthHeaders();
//   const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/available`);
//   url.searchParams.append("latitude", latitude.toString());
//   url.searchParams.append("longitude", longitude.toString());
//   url.searchParams.append("radius", radius.toString());
//   const response = await fetch(url.toString(), { headers });
//   if (!response.ok) throw new Error(`Failed to fetch available teams: ${response.statusText}`);
//   return response.json();
// };
// // 


// shared/services/rescueService.ts
// app/shared/services/rescueService.ts
import { getAuthHeaders } from "@lib/utils";
import type { ApiRescueTeam } from "@/shared/types";

// ==============================
// DTOs – ต้อง export ออกมา
// ==============================
export interface CreateRescueTeamDto {
  name: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  members: number;
  contact: string;
  vehicle: string;
}

export interface UpdateRescueTeamDto {
  name?: string;
  location?: {
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  members?: number;
  contact?: string;
  vehicle?: string;
}

export interface UpdateRescueTeamStatusDto {
  status: "available" | "on-mission" | "standby" | "offline";
  activeMission?: string;
  notes?: string;
}

// ==============================
// API Functions
// ==============================
export const createRescueTeam = async (data: CreateRescueTeamDto): Promise<ApiRescueTeam> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create rescue team: ${response.statusText}`);
  return response.json();
};

export const fetchRescueTeams = async (search?: string): Promise<ApiRescueTeam[]> => {
  const headers = getAuthHeaders();
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams`);
  if (search) url.searchParams.append("search", search);
  const response = await fetch(url.toString(), { headers });
  if (!response.ok) throw new Error(`Failed to fetch rescue teams: ${response.statusText}`);
  return response.json();
};

export const fetchRescueTeamById = async (id: string): Promise<ApiRescueTeam> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/${id}`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch rescue team: ${response.statusText}`);
  return response.json();
};

export const updateRescueTeam = async (
  id: string,
  data: UpdateRescueTeamDto
): Promise<ApiRescueTeam> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update rescue team: ${response.statusText}`);
  return response.json();
};

export const updateRescueTeamStatus = async (
  id: string,
  data: UpdateRescueTeamStatusDto
): Promise<ApiRescueTeam> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update team status: ${response.statusText}`);
  return response.json();
};

export const fetchAvailableTeams = async (
  latitude: number,
  longitude: number,
  radius: number = 10
): Promise<ApiRescueTeam[]> => {
  const headers = getAuthHeaders();
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/rescue-teams/available`);
  url.searchParams.append("latitude", latitude.toString());
  url.searchParams.append("longitude", longitude.toString());
  url.searchParams.append("radius", radius.toString());
  const response = await fetch(url.toString(), { headers });
  if (!response.ok) throw new Error(`Failed to fetch available teams: ${response.statusText}`);
  return response.json();
};