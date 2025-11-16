import { useState, useEffect } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import {
  fetchActiveEmergencies,
  updateEmergencyStatus,
  cancelCase,
} from "@/shared/services/emergencyService";

import { EmergencyCase } from "@/shared/types";

export const useRescueDashboard = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ดึงเคสจาก API ตอน mount
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

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    inProgress: cases.filter((c) => c.status === "in-progress").length,
    completed: cases.filter((c) => c.status === "completed").length,
    critical: cases.filter((c) => c.severity === 4).length,
    total: cases.length,
  };

  return {
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
    
  };
};
