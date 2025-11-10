// app/hospital/rescue-teams/hooks/useRescueTeams.ts
import { useState, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { RescueTeam } from "@/shared/types";

const rescueTeams: RescueTeam[] = [
  {
    id: 'RT-001',
    name: 'Rescue Team Alpha',
    status: 'available',
    members: 5,
    location: {
      address: 'Sukhumvit 24, Bangkok',
      coordinates: { lat: 13.7234, lng: 100.5678 },
    },
    contact: '081-234-5678',
    vehicle: 'Ambulance A-1',
    lastActive: '2025-03-15T14:30:00',
  },
  {
    id: 'RT-002',
    name: 'Rescue Team Bravo',
    status: 'on-mission',
    members: 4,
    location: {
      address: 'Silom Road, Bangkok',
      coordinates: { lat: 13.7245, lng: 100.5345 },
    },
    contact: '082-345-6789',
    vehicle: 'Ambulance B-2',
    activeMission: 'ER-2305-006',
    lastActive: '2025-03-15T14:45:00',
  },
  {
    id: 'RT-003',
    name: 'Rescue Team Charlie',
    status: 'standby',
    members: 5,
    location: {
      address: 'Ratchadapisek Road, Bangkok',
      coordinates: { lat: 13.7789, lng: 100.5432 },
    },
    contact: '083-456-7890',
    vehicle: 'Ambulance C-3',
    lastActive: '2025-03-15T14:15:00',
  },
  {
    id: 'RT-004',
    name: 'Rescue Team Delta',
    status: 'offline',
    members: 5,
    location: {
      address: 'Petchaburi Road, Bangkok',
      coordinates: { lat: 13.7456, lng: 100.5789 },
    },
    contact: '084-567-8901',
    vehicle: 'Ambulance D-4',
    lastActive: '2025-03-15T12:00:00',
  },
];

export const useRescueTeams = () => {
  const [teams, setTeams] = useState<RescueTeam[]>(rescueTeams);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const filteredTeams = useMemo(() => teams.filter((team) => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  ), [teams, searchQuery]);

  const stats = useMemo(() => ({
    total: teams.length,
    available: teams.filter(t => t.status === 'available').length,
    onMission: teams.filter(t => t.status === 'on-mission').length,
    totalMembers: teams.reduce((acc, team) => acc + team.members, 0),
  }), [teams]);

  return {
    teams: filteredTeams,
    stats,
    searchQuery,
    setSearchQuery,
  };
};