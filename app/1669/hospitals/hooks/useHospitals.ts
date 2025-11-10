// app/1669/hospitals/hooks/useHospitals.ts
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { fetchHospitals, updateHospitalStatus } from "@/shared/services/hospitalService";
// แก้ import ตามไฟล์ utils ที่แก้ไปแล้ว
import { statusColors, getCaseStatusLabel } from "@/shared/utils/statusUtils";
import { Hospital } from "@/shared/types";
import { webSocketClient } from "@lib/websocket";

export const useHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchHospitals();
      setHospitals(data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลโรงพยาบาลได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (hospitalId: string) => {
    try {
      setUpdatingId(hospitalId);
      const hospital = hospitals.find((h) => h.id === hospitalId);
      if (!hospital) return;
      // สถานะ "ACTIVE" และ "BUSY" อิงจากข้อมูลจริง ปรับได้ถ้าต้องการ
      const newStatus = hospital.status === "ACTIVE" ? "BUSY" : "ACTIVE";
      await updateHospitalStatus(hospitalId, newStatus);
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospitalId ? { ...h, status: newStatus } : h))
      );
      toast({
        title: "อัปเดตสถานะสำเร็จ",
        description: `สถานะโรงพยาบาล ${hospital.name} เปลี่ยนเป็น ${
          newStatus === "ACTIVE" ? "ใช้งานได้" : "ยุ่ง"
        }`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetchData();

    webSocketClient.connect(token);
    const handler = (data: any) => {
      console.log("Received hospital update:", data);
      fetchData();
      toast({
        title: "อัปเดตโรงพยาบาล",
        description: `มีการเปลี่ยนแปลงข้อมูลโรงพยาบาล ID: ${data.hospitalId}`,
      });
    };
    webSocketClient.on("hospitalUpdate", handler);

    return () => {
      webSocketClient.off("hospitalUpdate", handler);
      webSocketClient.disconnect();
    };
  }, [toast]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const query = searchQuery.toLowerCase();

      const nameMatch = h.name.toLowerCase().includes(query);
      const addressMatch = (h.address ?? "").toLowerCase().includes(query);
      const cityMatch = h.city ? h.city.toLowerCase().includes(query) : false;
      const phoneMatch = h.contactPhone ? h.contactPhone.includes(query) : false;

      return nameMatch || addressMatch || cityMatch || phoneMatch;
    });
  }, [hospitals, searchQuery]);

  const stats = useMemo(
    () => ({
      totalHospitals: hospitals.length,
      totalAvailableBeds: hospitals.reduce((sum, h) => sum + (h.availableBeds ?? 0), 0),
      activeHospitals: hospitals.filter((h) => h.status === "ACTIVE").length,
    }),
    [hospitals]
  );

  const handleContactHospital = (hospital: Hospital) => {
    if (hospital.contactPhone) {
      window.open(`tel:${hospital.contactPhone}`, "_blank");
    } else if (hospital.contactEmail) {
      window.open(
        `mailto:${hospital.contactEmail}?subject=Emergency Coordination - ${hospital.name}`,
        "_blank"
      );
    } else {
      toast({
        title: "ไม่พบข้อมูลติดต่อ",
        description: "กรุณาตรวจสอบข้อมูลโรงพยาบาล",
        variant: "destructive",
      });
    }
  };

  return {
    hospitals: filteredHospitals,
    stats,
    loading,
    updatingId,
    searchQuery,
    setSearchQuery,
    handleUpdateStatus,
    handleContactHospital,
    // เปลี่ยนส่งเป็น statusColors และ getCaseStatusLabel
    statusColors,
    getCaseStatusLabel,
    refetch: fetchData,
  };
};
