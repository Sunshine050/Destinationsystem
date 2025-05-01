'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, MapPin, ChevronDown, AlertTriangle } from 'lucide-react';
import CaseCard from '@/components/dashboard/case-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import MapView from '@/components/dashboard/map-view';
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
  description: string;
  symptoms: string[];
  assignedTo?: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
}

export default function EmergencyCenterCases() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    date: 'all',
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No access token found. Please login again.');

        const casesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!casesResponse.ok) {
          if (casesResponse.status === 401) throw new Error('Unauthorized. Please login again.');
          throw new Error(`Failed to fetch cases: ${casesResponse.statusText}`);
        }
        const casesData = await casesResponse.json();
        setCases(casesData);

        const hospitalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/hospital-capacities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!hospitalsResponse.ok) {
          if (hospitalsResponse.status === 401) throw new Error('Unauthorized. Please login again.');
          throw new Error(`Failed to fetch hospitals: ${hospitalsResponse.statusText}`);
        }
        const hospitalsData = await hospitalsResponse.json();

        const teamsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/team-locations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!teamsResponse.ok) {
          if (teamsResponse.status === 401) throw new Error('Unauthorized. Please login again.');
          throw new Error(`Failed to fetch rescue teams: ${teamsResponse.statusText}`);
        }
        const teamsData = await teamsResponse.json();

        setOrganizations([...hospitalsData, ...teamsData]);
      } catch (error: any) {
        if (typeof window !== 'undefined') {
          console.error('[EmergencyCenterCases] Error fetching data:', error);
        }
        toast({
          title: 'Error',
          description: error.message || 'Failed to load cases or organizations.',
          variant: 'destructive',
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
        toast({
          title: 'New Emergency',
          description: `New ${data.type} emergency reported.`,
        });
      });

      webSocketClient.onStatusUpdate((data) => {
        setCases((prev) =>
          prev.map((c) =>
            c.id === data.emergencyId ? { ...c, status: data.status, assignedTo: data.assignedTo } : c
          )
        );
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

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filters.status === 'all' || c.status === filters.status;

    const matchesSeverity =
      filters.severity === 'all' || c.severity.toString() === filters.severity;

    const matchesDate = (() => {
      if (filters.date === 'all') return true;
      const reportedAt = new Date(c.reportedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);

      if (filters.date === 'today') {
        return reportedAt.toDateString() === today.toDateString();
      }
      if (filters.date === 'yesterday') {
        return reportedAt.toDateString() === yesterday.toDateString();
      }
      if (filters.date === 'week') {
        return reportedAt >= weekStart;
      }
      return true;
    })();

    return matchesSearch && matchesStatus && matchesSeverity && matchesDate;
  });

  const handleAssignCase = async (caseId: string) => {
    if (!selectedOrganization) {
      toast({
        title: 'Error',
        description: 'Please select an organization to assign the case to.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found. Please login again.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/${caseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'ASSIGNED',
          assignedToId: selectedOrganization,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized. Please login again.');
        throw new Error(`Failed to assign case: ${response.statusText}`);
      }

      const org = organizations.find((o) => o.id === selectedOrganization);
      toast({
        title: 'Case Assigned',
        description: `Case ${caseId} has been assigned to ${org?.name}.`,
      });

      setSelectedCaseId(null);
      setSelectedOrganization('');
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        console.error('[EmergencyCenterCases] Error assigning case:', error);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign case.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelCase = async (caseId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found. Please login again.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/${caseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized. Please login again.');
        throw new Error(`Failed to cancel case: ${response.statusText}`);
      }

      toast({
        title: 'Case Cancelled',
        description: `Case ${caseId} has been cancelled.`,
      });
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        console.error('[EmergencyCenterCases] Error cancelling case:', error);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel case.',
        variant: 'destructive',
      });
    }
  };

  const getMapLocations = () => {
    return filteredCases.map((c) => ({
      id: c.id,
      title: c.title,
      severity: c.severity as 1 | 2 | 3 | 4,
      coordinates: c.location.coordinates,
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout role="emergency-center">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Emergency Cases</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage and monitor all emergency cases
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search by ID, name, or type..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity}
              onValueChange={(value) => setFilters({ ...filters, severity: value })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="1">Grade 1 (Mild)</SelectItem>
                <SelectItem value="2">Grade 2 (Moderate)</SelectItem>
                <SelectItem value="3">Grade 3 (Severe)</SelectItem>
                <SelectItem value="4">Grade 4 (Critical)</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.date === 'all'}
                  onCheckedChange={() => setFilters({ ...filters, date: 'all' })}
                >
                  All Dates
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === 'today'}
                  onCheckedChange={() => setFilters({ ...filters, date: 'today' })}
                >
                  Today
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === 'yesterday'}
                  onCheckedChange={() => setFilters({ ...filters, date: 'yesterday' })}
                >
                  Yesterday
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === 'week'}
                  onCheckedChange={() => setFilters({ ...filters, date: 'week' })}
                >
                  This Week
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('map')}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Map
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</p>
              <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                {filteredCases.length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</p>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                {filteredCases.filter((c) => c.status === 'PENDING').length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical</p>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                {filteredCases.filter((c) => c.severity === 4).length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                {filteredCases.filter((c) => c.status === 'COMPLETED').length}
              </Badge>
            </div>
          </div>
        </div>

        {selectedCaseId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4">Assign Case</h3>
              <Select
                value={selectedOrganization}
                onValueChange={(value) => setSelectedOrganization(value)}
              >
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({org.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={() => handleAssignCase(selectedCaseId)}>
                  Assign
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCaseId(null);
                    setSelectedOrganization('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredCases.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">
                  No cases found matching your criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCases.map((emergencyCase) => (
                  <CaseCard
                    key={emergencyCase.id}
                    {...emergencyCase}
                    severity={emergencyCase.severity as 1 | 2 | 3 | 4}
                    status={emergencyCase.status as any}
                    onAssign={() => setSelectedCaseId(emergencyCase.id)}
                    onCancel={() => handleCancelCase(emergencyCase.id)}
                    role="emergency-center"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <MapView locations={getMapLocations()} height="500px" />
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Showing {filteredCases.length} emergency cases on the map. Hover over markers for details.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}