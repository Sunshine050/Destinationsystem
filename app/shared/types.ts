// app/shared/types.ts

// ==============================
// 🚨 EMERGENCY CASE TYPES
// ==============================
export interface EmergencyRequestFromApi {
  id: string;
  description: string;
  status: string;
  grade: string;
  createdAt: string;
  patient: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  type: string;
  emergencyType?: string;
  medicalInfo?: {
    grade?: string;
    symptoms?: string | string[];
    emergencyType?: string;
  };
  location?: string;
  latitude?: number;
  longitude?: number;
  responses?: Array<{
    organization?: {
      name?: string;
    };
  }>;
}

export interface EmergencyCase {
  id: string;
  description: string;
  descriptionFull: string;
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
  grade: "CRITICAL" | "URGENT" | "NON_URGENT" | "UNKNOWN";
  severity: 1 | 2 | 3 | 4; // ✅ รองรับระดับความรุนแรง
  reportedAt: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  assignedTo?: string;
  symptoms: string[];
}

// ==============================
// 🏥 HOSPITAL TYPES
// ==============================
export interface Hospital {
  id: string;
  name: string;
  type?: string;
  status?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  availableBeds?: number;
  medicalInfo?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ==============================
// 🔍 FILTER STATE
// ==============================
export interface FilterState {
  status: string;
  severity: string;
  date: string;
}

// ==============================
// 🗺 MAP LOCATION
// ==============================
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

// ==============================
// 🔔 NOTIFICATIONS
// ==============================
export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

// ==============================
// 📊 DASHBOARD STATS
// ==============================
export interface DashboardStats {
  totalEmergencies: number;
  activeEmergencies: number;
  completedEmergencies: number;
  cancelledEmergencies: number;
  criticalCases: number;
  connectedHospitals: number;
  averageResponseTime: number;
  availableHospitalBeds: number;
}

// ==============================
// 📈 MONTHLY TREND
// ==============================
export interface MonthlyTrendData {
  month: string;
  admissions: number;
  readmissions: number;
  inpatient: number;
  outpatient: number;
  critical: number;
  urgent: number;
  nonUrgent: number;
}

// ==============================
// 🎨 SUPPORT MAPS (OPTIONAL)
// ==============================
export const gradeColors: Record<EmergencyCase["grade"], string> = {
  CRITICAL: "#ef4444", // แดง
  URGENT: "#f97316",   // ส้ม
  NON_URGENT: "#22c55e", // เขียว
  UNKNOWN: "#9ca3af",   // เทา (สำรอง)
};

export const gradeLabels: Record<EmergencyCase["grade"], string> = {
  CRITICAL: "วิกฤติ",
  URGENT: "เร่งด่วน",
  NON_URGENT: "ไม่เร่งด่วน",
  UNKNOWN: "ไม่ระบุ",
};

export interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  stats: {
    severity?: number;
    patientName?: string;
    status?: string;
  };
  details?: any;
}

export interface Filters {
  status: string;
  severity: string;
  date: string;
}

// ==============================
// เพิ่ม Types ที่คุณร้องขอ
// ==============================

export interface NotificationSettings {
  emergencyAlerts: boolean;
  statusUpdates: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface SystemSettings {
  language: string;
  timeZone: string;
  dateFormat: string;
  mapProvider: string;
  autoRefreshInterval: string;
}

export interface CommunicationSettings {
  primaryContactNumber: string;
  backupContactNumber: string;
  emergencyEmail: string;
  broadcastChannel: string;
}

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface EmergencySettings {
  defaultRadius: number;
  minUrgencyLevel: "CRITICAL" | "URGENT" | "NON_URGENT";
}
