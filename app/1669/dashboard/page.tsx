"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  Activity,
  Hospital,
  Search,
  Bell,
  ArrowRight,
} from "lucide-react";
import CaseCard from "@/components/dashboard/case-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { webSocketClient } from '@/lib/websocket';

interface EmergencyCase {
  id: string;
  title: string;
  status: string;
  severity: number;
  reportedAt: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  assignedTo?: string;
  description: string;
  symptoms: string[];
}

interface DashboardStats {
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
  critical: number;
  total: number;
  connectedHospitals: number;
}

export default function EmergencyCenterDashboard() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    critical: 0,
    total: 0,
    connectedHospitals: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token found");

        const statsResponse = await fetch("http://localhost:3001/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!statsResponse.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsResponse.json();

        const casesResponse = await fetch("http://localhost:3001/dashboard/active-emergencies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!casesResponse.ok) throw new Error("Failed to fetch cases");
        const casesData = await casesResponse.json();

        setCases(casesData);
        setStats({
          pending: casesData.filter((c: EmergencyCase) => c.status === "PENDING").length,
          assigned: casesData.filter((c: EmergencyCase) => c.status === "ASSIGNED").length,
          inProgress: casesData.filter((c: EmergencyCase) => c.status === "IN_PROGRESS").length,
          completed: casesData.filter((c: EmergencyCase) => c.status === "COMPLETED").length,
          critical: statsData.criticalCases,
          total: statsData.totalEmergencies,
          connectedHospitals: statsData.connectedHospitals,
        });
      } catch (error) {
        if (typeof window !== 'undefined') {
          console.error('[EmergencyCenterDashboard] Error fetching dashboard data:', error);
        }
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const token = localStorage.getItem('access_token');
    if (token) {
      webSocketClient.connect(token);

      webSocketClient.onEmergency((data) => {
        setCases((prev) => [
          {
            id: data.id,
            title: `Emergency ${data.id}`,
            status: 'PENDING',
            severity: data.grade === 'CRITICAL' ? 4 : data.grade === 'URGENT' ? 3 : 1,
            reportedAt: new Date().toISOString(),
            patientName: 'Unknown',
            contactNumber: 'N/A',
            emergencyType: data.type,
            location: {
              address: data.location?.address || 'Unknown',
              coordinates: {
                lat: data.coordinates?.latitude || 0,
                lng: data.coordinates?.longitude || 0,
              },
            },
            description: 'New emergency request',
            symptoms: [],
            assignedTo: data.assignedTo,
          },
          ...prev,
        ]);
        setStats((prev) => ({
          ...prev,
          pending: prev.pending + 1,
          total: prev.total + 1,
          critical: data.grade === 'CRITICAL' ? prev.critical + 1 : prev.critical,
        }));
        toast({
          title: 'New Emergency',
          description: `New ${data.type} emergency reported.`,
        });
      });

      webSocketClient.onStatusUpdate((data) => {
        setCases((prev) => {
          const updatedCases = prev.map((c) =>
            c.id === data.emergencyId ? { ...c, status: data.status, assignedTo: data.assignedTo } : c
          );
          setStats((prevStats) => ({
            ...prevStats,
            pending: updatedCases.filter((c) => c.status === "PENDING").length,
            assigned: updatedCases.filter((c) => c.status === "ASSIGNED").length,
            inProgress: updatedCases.filter((c) => c.status === "IN_PROGRESS").length,
            completed: updatedCases.filter((c) => c.status === "COMPLETED").length,
          }));
          return updatedCases;
        });
        toast({
          title: 'Status Update',
          description: `Emergency ${data.emergencyId} status updated to ${data.status}.`,
        });
      });

      webSocketClient.onDisconnect(() => {
        toast({
          title: 'WebSocket Disconnected',
          description: 'Disconnected from real-time updates. Attempting to reconnect...',
          variant: 'destructive',
        });
      });
    }

    return () => {
      webSocketClient.disconnect();
    };
  }, [toast]);

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignCase = async (caseId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch("http://localhost:3001/dashboard/assign-case", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseId,
          assignedToId: "thonburi-hospital-id",
        }),
      });

      if (!response.ok) throw new Error("Failed to assign case");

      toast({
        title: "Case assigned",
        description: `Case ${caseId} has been assigned to Thonburi Hospital.`,
      });
    } catch (error) {
      if (typeof window !== 'undefined') {
        console.error('[EmergencyCenterDashboard] Error assigning case:', error);
      }
      toast({
        title: "Error",
        description: "Failed to assign case.",
        variant: "destructive",
      });
    }
  };

  const handleCancelCase = async (caseId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch("http://localhost:3001/dashboard/cancel-case", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ caseId }),
      });

      if (!response.ok) throw new Error("Failed to cancel case");

      toast({
        title: "Case cancelled",
        description: `Case ${caseId} has been cancelled.`,
      });
    } catch (error) {
      if (typeof window !== 'undefined') {
        console.error('[EmergencyCenterDashboard] Error cancelling case:', error);
      }
      toast({
        title: "Error",
        description: "Failed to cancel case.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout role="emergency-center">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Emergency Response Center Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage and monitor emergency cases
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </Button>
            <Button>
              New Case
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Pending Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Active Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.assigned + stats.inProgress}</div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Critical Severity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.critical}</div>
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Connected Hospitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.connectedHospitals}</div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Hospital className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-xl font-bold">Emergency Cases</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="Search cases..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Cases</TabsTrigger>
              <TabsTrigger value="pending">
                Pending <Badge className="ml-1">{stats.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="assigned">
                Assigned <Badge className="ml-1">{stats.assigned}</Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress <Badge className="ml-1">{stats.inProgress}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed <Badge className="ml-1">{stats.completed}</Badge>
              </TabsTrigger>
            </TabsList>

            {["all", "pending", "assigned", "in-progress", "completed"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                {filteredCases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">No cases found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredCases
                      .filter((c) => tabValue === "all" || c.status === tabValue.toUpperCase())
                      .map((emergencyCase) => (
                        <CaseCard
                          key={emergencyCase.id}
                          {...emergencyCase}
                          severity={emergencyCase.severity as 1 | 2 | 3 | 4}
                          status={emergencyCase.status as any}
                          onAssign={() => handleAssignCase(emergencyCase.id)}
                          onCancel={() => handleCancelCase(emergencyCase.id)}
                          role="emergency-center"
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}