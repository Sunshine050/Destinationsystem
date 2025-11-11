// app/shared/services/hospitalService.ts
// API for hospitals (fetch/update/create/delete etc.)

import { getAuthHeaders } from "@lib/utils";
import { Hospital } from "@/shared/types";

// Define enum and DTO types ที่ match กับ backend DTO (จาก hospital.dto.ts)
export enum HospitalStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MAINTENANCE = "MAINTENANCE",
  BUSY = "BUSY", // ถ้าระบบใช้ BUSY ด้วย
}

interface CreateHospitalDto {
  name: string;
  address: string;
  city: string;
  state?: string;  // optional
  postalCode: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail?: string;  // optional
  totalBeds?: number;  // optional
  availableBeds?: number;  // optional
  icuBeds?: number;  // optional
  availableIcuBeds?: number;  // optional
}

interface UpdateHospitalDto extends Partial<CreateHospitalDto> {
  status?: HospitalStatus;  // optional, enum
}

interface UpdateHospitalCapacityDto {
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
  availableIcuBeds: number;
  notes?: string;  // optional
}

interface AcceptEmergencyDto {
  emergencyId: string;
  notes?: string;  // optional
}

// Function เดิม (เพิ่ม optional search)
export const fetchHospitals = async (search?: string): Promise<Hospital[]> => {
  const headers = getAuthHeaders();
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`);
  if (search) url.searchParams.append('search', search);
  const response = await fetch(url.toString(), {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch hospitals: ${response.statusText}`);
  const data = await response.json();
  return data.map((hospital: any) => ({
    ...hospital,
    availableBeds: hospital.availableBeds || 0,
  }));
};

// Function เดิม (ปรับ path ให้ match PUT /hospitals/:id สมมติ status เป็นส่วนหนึ่ง)
export const updateHospitalStatus = async (hospitalId: string, newStatus: HospitalStatus): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/${hospitalId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ status: newStatus }),  // สมมติ backend accept { status }
  });
  if (!response.ok) throw new Error(`Failed to update status: ${response.statusText}`);
};

// Functions ใหม่สำหรับ endpoints อื่น ๆ
export const createHospital = async (data: CreateHospitalDto): Promise<Hospital> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create hospital: ${response.statusText}`);
  return response.json();
};

export const fetchHospitalById = async (id: string): Promise<Hospital> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/${id}`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch hospital: ${response.statusText}`);
  return response.json();
};

export const updateHospital = async (id: string, data: UpdateHospitalDto): Promise<Hospital> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update hospital: ${response.statusText}`);
  return response.json();
};

export const deleteHospital = async (id: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error(`Failed to delete hospital: ${response.statusText}`);
};

export const updateHospitalCapacity = async (id: string, data: UpdateHospitalCapacityDto): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/${id}/capacity`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update capacity: ${response.statusText}`);
  return response.json();
};

export const acceptEmergency = async (hospitalId: string, data: AcceptEmergencyDto): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/${hospitalId}/accept-emergency`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to accept emergency: ${response.statusText}`);
  return response.json();
};

export const fetchNearbyHospitals = async (latitude: number, longitude: number, radius: number): Promise<Hospital[]> => {
  const headers = getAuthHeaders();
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/nearby/${latitude}/${longitude}`);
  url.searchParams.append('radius', radius.toString());
  const response = await fetch(url.toString(), {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch nearby hospitals: ${response.statusText}`);
  return response.json();
};

export const updateEmergencyResponseStatus = async (responseId: string): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/emergency-responses/${responseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
  });
  if (!response.ok) throw new Error(`Failed to update response status: ${response.statusText}`);
  return response.json();
};

export const notifyRescueTeam = async (responseId: string): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/emergency-responses/${responseId}/notify-rescue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
  });
  if (!response.ok) throw new Error(`Failed to notify rescue team: ${response.statusText}`);
  return response.json();
};

export const fetchEmergencyResponse = async (responseId: string): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/emergency-responses/${responseId}`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch emergency response: ${response.statusText}`);
  return response.json();
};

export const updateEmergencyResponseStatusManual = async (responseId: string, status: string): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/emergency-responses/${responseId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(`Failed to update response status manual: ${response.statusText}`);
  return response.json();
};