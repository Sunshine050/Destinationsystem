// app/shared/services/emergencyService.ts
import { getAuthHeaders } from "@lib/utils";
import { normalizeCaseData } from "../utils/dataNormalization";
import { EmergencyCase } from "../types";

export const fetchActiveEmergencies = async (): Promise<EmergencyCase[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`, {
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถดึงข้อมูลเคสฉุกเฉิน: ${response.statusText}`);
  const data = await response.json();
  return data.map(normalizeCaseData);
};

export const fetchHospitals = async (): Promise<any[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถดึงข้อมูลโรงพยาบาล: ${response.statusText}`);
  const data = await response.json();
  return data.map((h: any) => ({ id: h.id, name: h.name || "โรงพยาบาลไม่มีชื่อ" }));
};

export const assignCase = async (caseId: string, hospitalId: string): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/${caseId}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ hospitalId }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ไม่สามารถมอบหมายเคส: ${response.statusText} (${response.status}) - ${errorText}`);
  }
  return response.json();
};