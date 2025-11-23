import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { EmergencyCase, ApiRescueTeam, Hospital } from "@/shared/types";

import {
  fetchActiveEmergencies,
  transferCase,
  cancelCase,
  fetchHospitals,
} from "@/shared/services/emergencyService";
import { fetchHospitalById } from "@/shared/services/hospitalService";
import { fetchRescueTeams } from "@/shared/services/rescueService";

const initialStats = {
  assigned: 0,
  inProgress: 0,
  completed: 0,
  critical: 0,
  total: 0,
  beds: {
    total: 0,
    occupied: 0,
    available: 0,
    icu: {
      total: 0,
      occupied: 0,
      available: 0,
    },
  },
  resources: {
    totalStaff: 20,
    availableStaff: 15,
    totalAmbulances: 8,
    availableAmbulances: 3,
  },
};

export const useHospitalDashboard = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bedStats, setBedStats] = useState(initialStats.beds);
  const [resources, setResources] = useState(initialStats.resources);
  const [rescueTeams, setRescueTeams] = useState<ApiRescueTeam[]>([]);
  const [hospitalData, setHospitalData] = useState<Hospital | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 1. Load Case Data
  const loadCases = async () => {
    setIsLoading(true);
    try {
      const data = await fetchActiveEmergencies();
      setCases(data);
    } catch (error: any) {
      console.error("Error loading emergency cases:", error);
      // ถ้า error 500 และเราไม่มี hospitalId ให้เดาว่าเป็นเพราะเรื่องนี้
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userData = user?.user || user; // รองรับทั้ง { user: {...} } และ {...} โดยตรง
      
      if (!userData?.organizationId && !userData?.hospitalId) {
         console.warn("Ignored 500 error from fetchActiveEmergencies because user has no organizationId");
      } else {
        toast({
          title: "Error",
          description: "ไม่สามารถดึงข้อมูลเคสฉุกเฉินล่าสุดได้",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Load Hospital Resources (Beds, ICU, etc.)
  const loadHospitalResources = async () => {
    try {
      const userStr = localStorage.getItem("user");
      
      if (!userStr) {
        return;
      }

      const user = JSON.parse(userStr);
      // รองรับทั้ง { user: {...} } และ {...} โดยตรง
      const userData = user?.user || user;
      const hospitalId = userData?.organizationId || userData?.hospitalId;

      if (hospitalId) {
        setError(null); // Clear error if we have ID
        const hospitalData = await fetchHospitalById(hospitalId);
        setHospitalData(hospitalData);

        const capacity = hospitalData.medicalInfo?.capacity;
        
        const newBedStats = {
          total: capacity?.totalBeds || 0,
          occupied: (capacity?.totalBeds || 0) - (capacity?.availableBeds || 0),
          available: capacity?.availableBeds || 0,
          icu: {
            total: capacity?.icuBeds || 0,
            occupied: (capacity?.icuBeds || 0) - (capacity?.availableIcuBeds || 0),
            available: capacity?.availableIcuBeds || 0,
          },
        };
        
        setBedStats(newBedStats);
      } else {
        console.warn("⚠️ No organizationId/hospitalId found in user data");
        setError("บัญชีผู้ใช้นี้ยังไม่ได้ผูกกับข้อมูลโรงพยาบาล กรุณาติดต่อผู้ดูแลระบบ");
      }
    } catch (error) {
      console.error("❌ Error loading hospital resources:", error);
    }
  };

  // 3. Load Rescue Teams
  const loadRescueTeams = async () => {
    try {
      const teams = await fetchRescueTeams();
      setRescueTeams(teams);
    } catch (error) {
      console.error("Error loading rescue teams:", error);
    }
  };

  useEffect(() => {
    loadCases();
    loadHospitalResources();
    loadRescueTeams();
  }, []);

  const filteredCases = useMemo(
    () =>
      cases.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.patientName?.toLowerCase().includes(q) ||
          c.emergencyType.toLowerCase().includes(q)
        );
      }),
    [cases, searchQuery]
  );

  const stats = useMemo(
    () => ({
      assigned: filteredCases.filter((c) => c.status === "assigned").length,
      inProgress: filteredCases.filter((c) => c.status === "in-progress").length,
      completed: filteredCases.filter((c) => c.status === "completed").length,
      critical: filteredCases.filter((c) => c.severity === 4).length,
      total: filteredCases.length,
      beds: bedStats,
      resources,
    }),
    [filteredCases, bedStats, resources]
  );

  const handleTransferCase = async (caseId: string, teamId: string = "Rescue Team Alpha") => {
    try {
      await transferCase(caseId, teamId);
      await loadCases();
      toast({ title: "Case transferred", description: `Case ${caseId} ได้ถูกมอบหมายไปยัง ${teamId}.` });
    } catch (error) {
      console.error(`Error transferring case ${caseId}:`, error);
      toast({
        title: "Error",
        description: "ไม่สามารถโอนย้ายเคสได้ โปรดลองอีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const handleCancelCase = async (caseId: string) => {
    try {
      await cancelCase(caseId);
      await loadCases();
      toast({ title: "Case cancelled", description: `Case ${caseId} ได้ถูกยกเลิกแล้ว` });
    } catch (error) {
      console.error(`Error cancelling case ${caseId}:`, error);
      toast({
        title: "Error",
        description: "ไม่สามารถยกเลิกเคสได้ โปรดลองอีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const fetchHospitalsWrapper = async () => {
    try {
      return await fetchHospitals();
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      return [];
    }
  };

  return {
    cases: filteredCases,
    stats,
    searchQuery,
    setSearchQuery,
    handleTransferCase,
    handleCancelCase,
    isLoading,
    refetchCases: loadCases,
    refetchResources: loadHospitalResources,
    setCases,
    fetchHospitals: fetchHospitalsWrapper,
    rescueTeams,
    hospitalData,
    error,
  };
};