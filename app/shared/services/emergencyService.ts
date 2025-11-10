// app/shared/services/emergencyService.ts
import { getAuthHeaders } from "@lib/utils";
import { normalizeCaseData } from "../utils/dataNormalization";
import { EmergencyCase } from "../types";
import { Report } from "@/shared/types";

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

export const fetchReports = async (): Promise<Report[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch reports: ${response.statusText}`);
  const data = await response.json();
  return data.map((emergency: any) => ({
    id: emergency.id,
    title: emergency.title || `Emergency Case ${emergency.id}`,
    type: emergency.emergencyType || emergency.type || "emergency",
    date: emergency.reportedAt || emergency.createdAt,
    stats: {
      severity: Number(emergency.medicalInfo?.severity) || 0,
      patientName: `${emergency.patient?.firstName || ""} ${emergency.patient?.lastName || ""}`.trim() || "Unknown",
      status: (emergency.status || "pending").toLowerCase(),
    },
    details: emergency,
  }));
};

export const transferCase = async (caseId: string, team: string): Promise<void> => {
  const headers = getAuthHeaders();
  // Future: POST /hospital/cases/{id}/transfer { team }
  // For sample: return Promise.resolve();
  throw new Error("Implement API for transfer");
};

export const cancelCase = async (caseId: string): Promise<void> => {
  const headers = getAuthHeaders();
  // Future: PATCH /hospital/cases/{id}/cancel
  throw new Error("Implement API for cancel");
};