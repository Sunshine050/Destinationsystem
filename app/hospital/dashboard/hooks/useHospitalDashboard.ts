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
    id: "ER-2305-004",
    description: "Elderly Fall at Bangkae Home",
    descriptionFull: "Elderly male fell in bathroom. Complaining of hip pain and unable to stand.",
    status: "completed",
    severity: 2,
    grade: "URGENT",
    reportedAt: "2025-03-15T08:45:00",
    patientName: "Prasert Suksawat",
    contactNumber: "081-987-6543",
    emergencyType: "Fall",
    location: { address: "Bangkae Elderly Home, 123 Phetkasem Rd.", coordinates: { lat: 13.7123, lng: 100.4567 } },
    assignedTo: "Siriraj Hospital",
    symptoms: ["Hip Pain", "Limited Mobility", "Bruising"],
  },
  {
    id: "ER-2305-005",
    description: "Stroke Symptoms at Office Building",
    descriptionFull: "Female patient with sudden facial drooping and slurred speech during meeting.",
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

const initialStats = {
  assigned: 2,
  inProgress: 1,
  completed: 1,
  critical: 1,
  total: 4,
  beds: {
    total: 120,
    occupied: 82,
    available: 38,
    icu: {
      total: 15,
      occupied: 12,
      available: 3,
    },
  },
};

export const useHospitalDashboard = () => {
  const [cases, setCases] = useState<EmergencyCase[]>(hospitalCases);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredCases = useMemo(() => cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.patientName.toLowerCase().includes(q) ||
      c.emergencyType.toLowerCase().includes(q)
    );
  }), [cases, searchQuery]);

  const stats = useMemo(() => ({
    assigned: filteredCases.filter((c) => c.status === "assigned").length,
    inProgress: filteredCases.filter((c) => c.status === "in-progress").length,
    completed: filteredCases.filter((c) => c.status === "completed").length,
    critical: filteredCases.filter((c) => c.severity === 4).length,
    total: filteredCases.length,
    beds: initialStats.beds,
  }), [filteredCases]);

  const handleTransferCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, status: "in-progress", assignedTo: "Rescue Team Alpha" }
          : c
      )
    );
    toast({ title: "Case transferred", description: `Case ${caseId} has been assigned to Rescue Team Alpha.` });
  };

  const handleCancelCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, status: "cancelled" } : c
      )
    );
    toast({ title: "Case cancelled", description: `Case ${caseId} has been cancelled.` });
  };

  // ตัวอย่างฟังก์ชัน fetchHospitals (จำลอง async fetch)
  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch hospitals: ${response.statusText}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast({
        title: "Error",
        description: "Cannot fetch hospital data.",
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
    setCases,
    fetchHospitals,
  };
};
