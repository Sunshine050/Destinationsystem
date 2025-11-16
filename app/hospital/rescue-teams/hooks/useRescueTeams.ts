import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import type { RescueTeam } from "@/shared/types";
import { fetchRescueTeams, createRescueTeam } from "@/shared/services/rescueService";
import type { CreateRescueTeamDto } from "@/shared/services/rescueService";





export const useRescueTeams = () => {
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const loadTeams = async () => {
    try {
      const data = await fetchRescueTeams();
      setTeams(data);
    } catch (err: any) {
      toast({
        title: "โหลดข้อมูลทีมกู้ภัยล้มเหลว",
        description: err.message,
        variant: "destructive", // ต้องเป็น "destructive", "default", หรือ undefined
      });
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleCreateTeam = async (newTeamData: CreateRescueTeamDto) => {
    try {
      const createdTeam = await createRescueTeam(newTeamData);
      setTeams((prev) => [...prev, createdTeam]);
      toast({
        title: "สร้างทีมกู้ภัยสำเร็จ",
        variant: "default", // เปลี่ยนเป็น default ตามไทป์ที่รับได้
      });
    } catch (err: any) {
      toast({
        title: "สร้างทีมกู้ภัยล้มเหลว",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const filteredTeams = useMemo(
    () =>
      teams.filter(
        (team) =>
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [teams, searchQuery]
  );

  const stats = useMemo(() => {
    const totalMembers = teams.reduce((acc, team) => {
      if (typeof team.members === "number") return acc + team.members;
      return acc;
    }, 0);

    return {
      total: teams.length,
      available: teams.filter((t) => t.status === "available").length,
      onMission: teams.filter((t) => t.status === "on-mission").length,
      totalMembers,
    };
  }, [teams]);

  return {
    teams: filteredTeams,
    stats,
    searchQuery,
    setSearchQuery,
    handleCreateTeam,
    loadTeams,
  };
};
