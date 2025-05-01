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
  Plus,
} from "lucide-react";
import CaseCard from "@/components/dashboard/case-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { webSocketClient } from "@/lib/websocket";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const { toast } = useToast();

  const [newCaseData, setNewCaseData] = useState({
    title: "",
    patientName: "",
    contactNumber: "",
    emergencyType: "Accident",
    locationAddress: "",
    description: "",
    severity: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token found");

        const statsResponse = await fetch("http://localhost:3001/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!statsResponse.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsResponse.json();

        const casesResponse = await fetch("http://localhost:3001/dashboard/active-emergencies", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
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
        console.error("[EmergencyCenterDashboard] Error fetching dashboard data:", error);
        toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const token = localStorage.getItem("access_token");
    if (token) {
      webSocketClient.connect(token);

      webSocketClient.onEmergency((data) => {
        setCases((prev) => [
          {
            id: data.id,
            title: `Emergency ${data.id}`,
            status: "PENDING",
            severity: data.grade === "CRITICAL" ? 4 : data.grade === "URGENT" ? 3 : 1,
            reportedAt: new Date().toISOString(),
            patientName: "Unknown",
            contactNumber: "N/A",
            emergencyType: data.type,
            location: {
              address: data.location?.address || "Unknown",
              coordinates: { lat: data.coordinates?.latitude || 0, lng: data.coordinates?.longitude || 0 },
            },
            description: "New emergency request",
            symptoms: [],
            assignedTo: data.assignedTo,
          },
          ...prev,
        ]);
        setStats((prev) => ({
          ...prev,
          pending: prev.pending + 1,
          total: prev.total + 1,
          critical: data.grade === "CRITICAL" ? prev.critical + 1 : prev.critical,
        }));
        toast({ title: "New Emergency", description: `New ${data.type} emergency reported.` });
      });

      webSocketClient.onStatusUpdate((data) => {
        setCases((prev) =>
          prev.map((c) =>
            c.id === data.emergencyId ? { ...c, status: data.status, assignedTo: data.assignedTo } : c
          )
        );
        setStats((prev) => {
          const updatedCases = cases.map((c) =>
            c.id === data.emergencyId ? { ...c, status: data.status, assignedTo: data.assignedTo } : c
          );
          return {
            ...prev,
            pending: updatedCases.filter((c) => c.status === "PENDING").length,
            assigned: updatedCases.filter((c) => c.status === "ASSIGNED").length,
            inProgress: updatedCases.filter((c) => c.status === "IN_PROGRESS").length,
            completed: updatedCases.filter((c) => c.status === "COMPLETED").length,
          };
        });
        toast({ title: "Status Update", description: `Emergency ${data.emergencyId} status updated to ${data.status}.` });
      });

      webSocketClient.on("notification", (data: Notification) => {
        setNotifications((prev) => {
          const updatedNotifications = [data, ...prev].slice(0, 10); // จำกัด 10 รายการล่าสุด
          return updatedNotifications;
        });
        toast({ title: data.title, description: data.description || "No description available" });
      });

      webSocketClient.onDisconnect(() => {
        toast({
          title: "WebSocket Disconnected",
          description: "Disconnected from real-time updates. Attempting to reconnect...",
          variant: "destructive",
        });
      });
    }

    return () => {
      webSocketClient.disconnect();
    };
  }, [toast, cases]);

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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ caseId, assignedToId: "thonburi-hospital-id" }),
      });

      if (!response.ok) throw new Error("Failed to assign case");

      toast({ title: "Case assigned", description: `Case ${caseId} has been assigned to Thonburi Hospital.` });
    } catch (error) {
      console.error("[EmergencyCenterDashboard] Error assigning case:", error);
      toast({ title: "Error", description: "Failed to assign case.", variant: "destructive" });
    }
  };

  const handleCancelCase = async (caseId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch("http://localhost:3001/dashboard/cancel-case", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ caseId }),
      });

      if (!response.ok) throw new Error("Failed to cancel case");

      toast({ title: "Case cancelled", description: `Case ${caseId} has been cancelled.` });
    } catch (error) {
      console.error("[EmergencyCenterDashboard] Error cancelling case:", error);
      toast({ title: "Error", description: "Failed to cancel case.", variant: "destructive" });
    }
  };

  const handleCreateNewCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch("http://localhost:3001/dashboard/create-case", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          title: newCaseData.title,
          patientName: newCaseData.patientName,
          contactNumber: newCaseData.contactNumber,
          emergencyType: newCaseData.emergencyType,
          locationAddress: newCaseData.locationAddress,
          description: newCaseData.description,
          severity: newCaseData.severity,
        }),
      });

      if (!response.ok) throw new Error("Failed to create case");
      const newCase = await response.json();

      setCases((prev) => [newCase, ...prev]);
      setStats((prev) => ({
        ...prev,
        pending: prev.pending + 1,
        total: prev.total + 1,
        critical: newCase.severity === 4 ? prev.critical + 1 : prev.critical,
      }));
      setNewCaseOpen(false);
      setNewCaseData({
        title: "",
        patientName: "",
        contactNumber: "",
        emergencyType: "Accident",
        locationAddress: "",
        description: "",
        severity: 1,
      });
      toast({ title: "Success", description: "New case created successfully." });
    } catch (error) {
      console.error("[EmergencyCenterDashboard] Error creating case:", error);
      toast({ title: "Error", description: "Failed to create case.", variant: "destructive" });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout role="emergency-center">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Emergency Response Center Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and monitor emergency cases</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={newCaseOpen} onOpenChange={setNewCaseOpen}>
              <DialogTrigger asChild>
                <Button>
                  New Case <Plus className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Emergency Case</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateNewCase} className="space-y-4">
                  <Input
                    placeholder="Case Title"
                    value={newCaseData.title}
                    onChange={(e) => setNewCaseData({ ...newCaseData, title: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Patient Name"
                    value={newCaseData.patientName}
                    onChange={(e) => setNewCaseData({ ...newCaseData, patientName: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Contact Number"
                    value={newCaseData.contactNumber}
                    onChange={(e) => setNewCaseData({ ...newCaseData, contactNumber: e.target.value })}
                  />
                  <select
                    value={newCaseData.emergencyType}
                    onChange={(e) => setNewCaseData({ ...newCaseData, emergencyType: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="Accident">Accident</option>
                    <option value="Medical">Medical</option>
                    <option value="Fire">Fire</option>
                  </select>
                  <Input
                    placeholder="Location Address"
                    value={newCaseData.locationAddress}
                    onChange={(e) => setNewCaseData({ ...newCaseData, locationAddress: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Description"
                    value={newCaseData.description}
                    onChange={(e) => setNewCaseData({ ...newCaseData, description: e.target.value })}
                  />
                  <select
                    value={newCaseData.severity}
                    onChange={(e) => setNewCaseData({ ...newCaseData, severity: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">Urgent</option>
                    <option value="4">Critical</option>
                  </select>
                  <DialogFooter>
                    <Button type="submit">Create Case</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setNotifications((prev) => prev.map(n => ({ ...n, read: true })))}>
              <Bell className="h-4 w-4" />
              Notifications ({notifications.filter(n => !n.read).length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Cases</CardTitle>
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
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Assigned Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.assigned}</div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical Cases</CardTitle>
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

        <Dialog open={notifications.length > 0 && notifications.some(n => !n.read)} onOpenChange={() => setNotifications((prev) => prev.map(n => ({ ...n, read: true })))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-2 rounded ${notif.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  <p className="font-semibold">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.description}</p>
                  <p className="text-xs text-gray-500">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setNotifications((prev) => prev.map(n => ({ ...n, read: true })))}>Clear All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}