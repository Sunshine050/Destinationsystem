// app/shared/types.ts
export interface EmergencyCase {
  id: string;
  description: string;
  descriptionFull: string;
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
  severity: 1 | 2 | 3 | 4;
  grade: "CRITICAL" | "URGENT" | "NON_URGENT" | "UNKNOWN";
  reportedAt: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  location: { address: string; coordinates: { lat: number; lng: number } };
  assignedTo?: string;
  symptoms: string[];
}

export interface Hospital {
  id: string;
  name: string;
}

export interface FilterState {
  status: string;
  severity: string;
  date: string;
}

export interface MapLocation {
  id: string;
  title: string;
  severity: number;
  coordinates: [number, number];
  address: string;
  description: string;
  patientName: string;
  status: EmergencyCase["status"];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}