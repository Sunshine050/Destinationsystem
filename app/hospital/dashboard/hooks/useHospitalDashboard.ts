import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { EmergencyCase } from "@/shared/types";

// *****************************************************************
// 🚨 การจำลองการ Import Service API 🚨
// *****************************************************************
// สมมติการ Import ที่จำเป็น
import {
  fetchActiveEmergencies,
  transferCase,
  cancelCase,
  fetchHospitals,
  // 🚨 สมมติว่ามีฟังก์ชันสำหรับดึงสถานะเตียง (Bed Stats)
  // หากมี API จริง ควร Import ฟังก์ชันนั้นมา เช่น fetchBedStatus
} from "@/shared/services/emergencyService"; // ต้องเปลี่ยน path ให้ถูกต้องจริง

// ลบ hospitalCases และ initialStats mock-up ออกไปทั้งหมด
// กำหนด Initial Stats เป็น 0 เพื่อรอข้อมูล API
const initialStats = {
  assigned: 0,
  inProgress: 0,
  completed: 0,
  critical: 0,
  total: 0,
  // ตั้ง Bed Stats เป็น 0/0 เพื่อรอการดึงข้อมูลจริง
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
};

export const useHospitalDashboard = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // 🚨 เพิ่ม State สำหรับ Bed/ICU Stats โดยเฉพาะ (เพื่อให้สามารถ Fetch แยกได้)
  const [bedStats, setBedStats] = useState(initialStats.beds); 
  const { toast } = useToast();

  // 1. Load Case Data
  const loadCases = async () => {
    setIsLoading(true);
    try {
      const data = await fetchActiveEmergencies();
      setCases(data);
    } catch (error) {
      console.error("Error loading emergency cases:", error);
      toast({
        title: "Error",
        description: "ไม่สามารถดึงข้อมูลเคสฉุกเฉินล่าสุดได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 🚨 2. Load Bed/ICU Status Data (สมมติฟังก์ชัน API)
  const loadBedStatus = async () => {
    // หากมี API สำหรับ Bed Status โดยเฉพาะ
    // try {
    //   const statusData = await fetchBedStatus();
    //   setBedStats(statusData);
    // } catch (error) {
    //   console.error("Error loading bed status:", error);
    // }
    // เนื่องจากยังไม่มี API จริง เราจะปล่อยให้เป็น 0/0 ตาม initial state
  };

  useEffect(() => {
    loadCases();
    loadBedStatus(); // เรียกโหลด Bed Status ด้วย
  }, []);


  const filteredCases = useMemo(() => cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.patientName?.toLowerCase().includes(q) ||
      c.emergencyType.toLowerCase().includes(q)
    );
  }), [cases, searchQuery]);

  // 3. Compute Stats โดยใช้ Bed Stats จาก State แทน Mock
  const stats = useMemo(() => ({
    assigned: filteredCases.filter((c) => c.status === "assigned").length,
    inProgress: filteredCases.filter((c) => c.status === "in-progress").length,
    completed: filteredCases.filter((c) => c.status === "completed").length,
    critical: filteredCases.filter((c) => c.severity === 4).length,
    total: filteredCases.length,
    beds: bedStats, // ใช้ bedStats จาก State ที่รอข้อมูล API
  }), [filteredCases, bedStats]);

  const handleTransferCase = async (caseId: string, teamId: string = "Rescue Team Alpha") => {
    try {
      await transferCase(caseId, teamId);
      await loadCases(); // Refetch case data
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
      await loadCases(); // Refetch case data
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
      toast({
        title: "Error",
        description: "ไม่สามารถดึงข้อมูลโรงพยาบาล.",
        variant: "destructive",
      });
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
    refetchBedStats: loadBedStatus, // เพิ่มฟังก์ชันเรียก Bed Stats
    setCases,
    fetchHospitals: fetchHospitalsWrapper,
  };
};