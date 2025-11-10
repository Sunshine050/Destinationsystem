// app/hospital/reports/hooks/useHospitalReports.ts
import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { HospitalReport } from "@/shared/types";

const reports: HospitalReport[] = [
  {
    id: 1,
    title: "Emergency Department Performance",
    type: "emergency",
    date: "2025-03-15",
    stats: { totalPatients: 156, avgWaitTime: 22, criticalCases: 34, bedOccupancy: 85 },
  },
  {
    id: 2,
    title: "Resource Utilization Report",
    type: "resources",
    date: "2025-03-14",
    stats: { bedUtilization: 78, staffUtilization: 92, equipmentUsage: 65, supplies: 88 },
  },
  {
    id: 3,
    title: "Patient Care Analysis",
    type: "patients",
    date: "2025-03-13",
    stats: { admissions: 89, discharges: 76, transfers: 12, satisfaction: 94 },
  },
];

export const useHospitalReports = () => {
  const [reportsData, setReportsData] = useState<HospitalReport[]>(reports);
  const [reportType, setReportType] = useState("all");
  const [timePeriod, setTimePeriod] = useState("month");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const filteredReports = useMemo(() => reportType === "all" ? reportsData : reportsData.filter((r) => r.type === reportType), [reportsData, reportType]);

  const handleGenerateReport = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({ title: "Report Generated", description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report for the last ${timePeriod} has been generated.` });
    }, 2000);
  }, [reportType, timePeriod, toast]);

  const handleDownload = useCallback((reportId: number) => {
    toast({ title: "Download Started", description: "Your report is being downloaded..." });
  }, [toast]);

  return {
    reports: filteredReports,
    reportType,
    setReportType,
    timePeriod,
    setTimePeriod,
    isGenerating,
    handleGenerateReport,
    handleDownload,
  };
};