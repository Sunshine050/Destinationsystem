// app/shared/services/hospitalService.ts
// API for hospitals (fetch/update)
import { getAuthHeaders } from "@lib/utils";
import { Hospital } from "@/shared/types";

export const fetchHospitals = async (): Promise<Hospital[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch hospitals: ${response.statusText}`);
  const data = await response.json();
  return data.map((hospital: any) => ({
    ...hospital,
    availableBeds: hospital.availableBeds || 0,
  }));
};

export const updateHospitalStatus = async (hospitalId: string, newStatus: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/${hospitalId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!response.ok) throw new Error("Failed to update status");
};