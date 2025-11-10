// app/shared/services/dashboardService.ts
// API for dashboard (stats, extend for future)
import { getAuthHeaders } from "@lib/utils";
import { DashboardStats } from "@/shared/types";

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch stats: ${response.statusText}`);
  return response.json();
};