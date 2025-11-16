import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

export type EmergencyCase = {
  id: string;
  title: string;
  status: 'in-progress' | 'completed' | 'cancelled';
  severity: 1 | 2 | 3 | 4;
  reportedAt: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  assignedTo: string;
  description: string;
  symptoms: string[];
};

const initialCases: EmergencyCase[] = [
  {
    id: 'ER-2305-003',
    title: 'Drowning at Blue Beach Resort',
    status: 'in-progress',
    severity: 4,
    reportedAt: '2025-03-15T11:17:22',
    patientName: 'Michael Johnson',
    contactNumber: '062-345-6789',
    emergencyType: 'Drowning',
    location: {
      address: 'Blue Beach Resort, Koh Samui',
      coordinates: { lat: 9.5678, lng: 100.0123 },
    },
    assignedTo: 'Rescue Team Alpha',
    description: 'Tourist found unconscious in hotel swimming pool. CPR in progress by hotel staff.',
    symptoms: ['Unconsciousness', 'Not Breathing', 'Cyanosis'],
  },
  {
    id: 'ER-2305-006',
    title: 'Road Accident on Sukhumvit 24',
    status: 'in-progress',
    severity: 3,
    reportedAt: '2025-03-15T14:45:30',
    patientName: 'Sarah Thompson',
    contactNumber: '095-789-1234',
    emergencyType: 'Traffic Accident',
    location: {
      address: 'Sukhumvit 24, near BTS Phrom Phong',
      coordinates: { lat: 13.7234, lng: 100.5678 },
    },
    assignedTo: 'Rescue Team Bravo',
    description: 'Motorcycle collision with car. Patient conscious but with leg injury and bleeding.',
    symptoms: ['Leg Pain', 'Bleeding', 'Abrasions'],
  },
  {
    id: 'ER-2305-007',
    title: 'Heart Attack at Fitness Center',
    status: 'completed',
    severity: 4,
    reportedAt: '2025-03-15T10:15:00',
    patientName: 'Thanapat Srichai',
    contactNumber: '081-456-7890',
    emergencyType: 'Heart Attack',
    location: {
      address: 'FitForLife Gym, Sathorn Square Building',
      coordinates: { lat: 13.7234, lng: 100.5288 },
    },
    assignedTo: 'Rescue Team Charlie',
    description: 'Middle-aged male collapsed during workout with chest pain and shortness of breath.',
    symptoms: ['Chest Pain', 'Shortness of Breath', 'Sweating'],
  },
];

export const useRescueCases = () => {
  const [cases, setCases] = useState<EmergencyCase[]>(initialCases);
  const { toast } = useToast();

  const handleCompleteCase = (caseId: string) => {
    setCases(prev =>
      prev.map(c =>
        c.id === caseId ? { ...c, status: 'completed' as const } : c
      )
    );
    toast({
      title: "Mission completed",
      description: `Case ${caseId} has been marked as completed.`,
    });
  };

  const handleCancelCase = (caseId: string) => {
    setCases(prev =>
      prev.map(c =>
        c.id === caseId ? { ...c, status: 'cancelled' as const } : c
      )
    );
    toast({
      title: "Mission cancelled",
      description: `Case ${caseId} has been cancelled.`,
    });
  };

  return {
    cases,
    handleCompleteCase,
    handleCancelCase,
  };
};