// hooks/useRescueDashboard.ts
import { useState, useEffect } from "react";
import { useToast } from "@/shared/hooks/use-toast";

// === Emergency APIs ===
import {
  fetchActiveEmergencies,
  updateEmergencyStatus,
  cancelCase,
} from "@/shared/services/emergencyService";

// === Auth Services ===
import {
  fetchUserProfile,
  saveUserSettings,
  saveHospitalSettings,
  registerUser,
  loginUser,
  refreshToken,
  initiateOAuth,
  verifyToken,
  supabaseLogin,
} from "@/shared/services/authService";

// === Rescue Team Services ===
import {
  createRescueTeam,
  fetchRescueTeams,
  fetchRescueTeamById,
  updateRescueTeam,
  updateRescueTeamStatus,
  fetchAvailableTeams,
} from "@/shared/services/rescueService";

// === Notification Services (เพิ่มใหม่ทั้งหมด) ===
import {
  fetchNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/shared/services/notificationService";

import { EmergencyCase } from "@/shared/types";

// === Enum และ DTO ===
enum UserRole {
  PATIENT = "PATIENT",
  EMERGENCY_CENTER = "EMERGENCY_CENTER",
  HOSPITAL = "HOSPITAL",
  RESCUE_TEAM = "RESCUE_TEAM",
  ADMIN = "ADMIN",
}

interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

interface LoginDto {
  email: string;
  password: string;
}

interface OAuthLoginDto {
  provider: string;
  redirectUrl?: string;
}

interface RefreshTokenDto {
  refreshToken: string;
}

export const useRescueDashboard = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Load Emergency Cases ---
  useEffect(() => {
    setLoading(true);
    fetchActiveEmergencies()
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "ไม่สามารถโหลดเคสฉุกเฉินได้");
        setLoading(false);
      });
  }, []);

  // --- Complete Case ---
  const handleCompleteCase = async (caseId: string) => {
    try {
      await updateEmergencyStatus(caseId, { status: "completed" });
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: "completed" } : c))
      );
      toast({
        title: "Mission completed",
        description: `Case ${caseId} has been successfully completed.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: `ไม่สามารถอัปเดตสถานะเคส: ${err.message || err}`,
        variant: "destructive",
      });
    }
  };

  // --- Cancel Case ---
  const handleCancelCase = async (caseId: string) => {
    try {
      await cancelCase(caseId);
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: "cancelled" } : c))
      );
      toast({
        title: "Mission cancelled",
        description: `Case ${caseId} has been cancelled.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: `ไม่สามารถยกเลิกเคส: ${err.message || err}`,
        variant: "destructive",
      });
    }
  };

  // --- Filters ---
  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Stats ---
  const stats = {
    inProgress: cases.filter((c) => c.status === "in-progress").length,
    completed: cases.filter((c) => c.status === "completed").length,
    critical: cases.filter((c) => c.severity === 4).length,
    total: cases.length,
  };

  return {
    // --- Dashboard state ---
    cases,
    filteredCases,
    searchQuery,
    setSearchQuery,
    handleCompleteCase,
    handleCancelCase,
    stats,
    loading,
    error,
    setCases,

    // ============================
    // ⚡ AUTH API EXPORT
    // ============================
    fetchUserProfile,
    saveUserSettings,
    saveHospitalSettings,
    registerUser,
    loginUser,
    refreshToken,
    initiateOAuth,
    verifyToken,
    supabaseLogin,

    // ============================
    // 🚑 RESCUE TEAM API EXPORT
    // ============================
    createRescueTeam,
    fetchRescueTeams,
    fetchRescueTeamById,
    updateRescueTeam,
    updateRescueTeamStatus,
    fetchAvailableTeams,

    // ============================
    // 🔔 NOTIFICATION API EXPORT (ใหม่)
    // ============================
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};
