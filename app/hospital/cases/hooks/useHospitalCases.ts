// app/hospital/cases/hooks/useHospitalCases.ts
import { useState, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { EmergencyCase } from "@/shared/types";

const hospitalCases: EmergencyCase[] = [
  {
    id: "ER-2305-002",
    description: "Unconscious Person at Central Plaza",
    descriptionFull: "Patient suddenly collapsed while eating. No visible injuries.",
    status: "assigned",
    severity: 2,
    grade: "URGENT",
    reportedAt: "2025-03-15T10:05:43",
    patientName: "Wanida Rakdee",
    contactNumber: "089-876-5432",
    emergencyType: "Unconsciousness",
    location: { address: "Central Plaza, 5th Floor, Food Court", coordinates: { lat: 13.8765, lng: 100.4321 } },
    assignedTo: "Thonburi Hospital",
    symptoms: ["Unconsciousness", "Pallor"],
  },
  {
    id: "ER-2305-003",
    description: "Drowning at Blue Beach Resort",
    descriptionFull: "Tourist found unconscious in hotel swimming pool. CPR in progress by hotel staff.",
    status: "in-progress",
    severity: 4,
    grade: "CRITICAL",
    reportedAt: "2025-03-15T11:17:22",
    patientName: "Michael Johnson",
    contactNumber: "062-345-6789",
    emergencyType: "Drowning",
    location: { address: "Blue Beach Resort, Koh Samui", coordinates: { lat: 9.5678, lng: 100.0123 } },
    assignedTo: "Samui International Hospital",
    symptoms: ["Unconsciousness", "Not Breathing", "Cyanosis"],
  },
  {
    id: "ER-2305-005",
    description: "Stroke Symptoms at Office Building",
    descriptionFull: "Female patient with sudden facial drooping slurred speech during meeting.",
    status: "assigned",
    severity: 3,
    grade: "URGENT",
    reportedAt: "2025-03-15T12:30:15",
    patientName: "Somying Jaidee",
    contactNumber: "085-123-4567",
    emergencyType: "Stroke",
    location: { address: "SCB Park Plaza, 12th Floor, Ratchadapisek Rd.", coordinates: { lat: 13.8123, lng: 100.5678 } },
    assignedTo: "Thonburi Hospital",
    symptoms: ["Facial Drooping", "Slurred Speech", "Arm Weakness"],
  },
];

export const useHospitalCases = () => {
  const [cases, setCases] = useState<EmergencyCase[]>(hospitalCases);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState({ status: "all", severity: "all", date: "all" });
  const { toast } = useToast();

  const filteredCases = useMemo(() => cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filters.status === "all" || c.status === filters.status;
    const matchesSeverity = filters.severity === "all" || c.severity.toString() === filters.severity;
    const matchesDate = filters.date === "all"; // Simplified for sample
    return matchesSearch && matchesStatus && matchesSeverity && matchesDate;
  }), [cases, searchQuery, filters]);

  const handleTransferCase = (caseId: string) => {
    setCases((prev) => prev.map((c) => c.id === caseId ? { ...c, status: "in-progress", assignedTo: "Rescue Team Alpha" } : c));
    toast({ title: "Case transferred", description: `Case ${caseId} has been assigned to Rescue Team Alpha.` });
  };

  const handleCancelCase = (caseId: string) => {
    setCases((prev) => prev.map((c) => c.id === caseId ? { ...c, status: "cancelled" } : c));
    toast({ title: "Case cancelled", description: `Case ${caseId} has been cancelled.` });
  };

  const getMapLocations = useMemo(() => filteredCases.map((c) => ({
    id: c.id,
    title: c.description,
    severity: c.severity,
    coordinates: [c.location.coordinates.lat, c.location.coordinates.lng] as [number, number],
  })), [filteredCases]);

  return {
    cases: filteredCases,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    handleTransferCase,
    handleCancelCase,
    getMapLocations,
  };
};