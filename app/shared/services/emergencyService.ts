// app/shared/services/emergencyService.ts
// API for emergencies (create/fetch/update/assign etc.)

import { getAuthHeaders } from "@lib/utils";
import { normalizeCaseData } from "../utils/dataNormalization";
import { EmergencyCase } from "../types";
import { Report } from "@/shared/types";

// Define DTO types ที่ match กับ backend (infer จาก SosController/dto)
interface CreateEmergencyRequestDto {
  type: string;  // เช่น 'accident', 'medical'
  location?: { latitude: number; longitude: number };  // optional ถ้ามี
  medicalInfo?: { severity: number; details: string };  // ปรับตาม fields จริง
  // เพิ่ม fields อื่นจาก dto/sos.dto
}

interface UpdateEmergencyStatusDto {
  status: string;  // เช่น 'in_progress', 'resolved'
  notes?: string;  // optional
}

interface AssignCaseDto {  // สำหรับ transfer (assign to team) จาก DashboardController
  caseId: string;
  teamId: string;  // หรือ hospitalId ถ้า assign hospital
}

interface CancelCaseDto {  // จาก DashboardController
  caseId: string;
  reason?: string;
}

// Functions เดิม (ปรับ path เป็น /sos/dashboard/active-emergencies)
export const fetchActiveEmergencies = async (): Promise<EmergencyCase[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/dashboard/active-emergencies`, {
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/dashboard/active-emergencies`, {
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

// Implement transferCase ด้วย /dashboard/assign-case (สมมติ transfer to team)
export const transferCase = async (caseId: string, team: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/assign-case`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ caseId, teamId: team }),  // สมมติ DTO { caseId, teamId }
  });
  if (!response.ok) throw new Error(`Failed to transfer case: ${response.statusText}`);
};

// Implement cancelCase ด้วย /dashboard/cancel-case
export const cancelCase = async (caseId: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/cancel-case`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ caseId }),  // สมมติ DTO { caseId }
  });
  if (!response.ok) throw new Error(`Failed to cancel case: ${response.statusText}`);
};

// Functions ใหม่สำหรับ endpoints อื่น ๆ
export const createEmergencyRequest = async (data: CreateEmergencyRequestDto): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create emergency: ${response.statusText}`);
  return response.json();
};

export const updateEmergencyStatus = async (id: string, data: UpdateEmergencyStatusDto): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update status: ${response.statusText}`);
  return response.json();
};

export const getEmergencyRequests = async (): Promise<EmergencyCase[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch user emergencies: ${response.statusText}`);
  const data = await response.json();
  return data.map(normalizeCaseData);
};

export const getAllEmergencyRequests = async (): Promise<EmergencyCase[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/all`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch all emergencies: ${response.statusText}`);
  const data = await response.json();
  return data.map(normalizeCaseData);
};

export const getEmergencyRequestById = async (id: string): Promise<EmergencyCase> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/${id}`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch emergency by id: ${response.statusText}`);
  const data = await response.json();
  return normalizeCaseData(data);
};