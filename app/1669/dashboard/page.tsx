"use client"

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle,
  Clock,
  Check,
  X,
  ArrowRight,
  Search,
  Bell,
  Hospital,
  Activity
} from 'lucide-react';
import CaseCard from '@/components/dashboard/case-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Emergency cases sample data
const emergencyCases = [
  {
    id: 'ER-2305-001',
    title: 'Car Accident on Highway 7',
    status: 'pending',
    severity: 3,
    reportedAt: '2025-03-15T09:23:11',
    patientName: 'Somchai Jaidee',
    contactNumber: '081-234-5678',
    emergencyType: 'Car Accident',
    location: {
      address: 'Highway 7, Km. 15, Pathum Thani',
      coordinates: {
        lat: 13.9876,
        lng: 100.5432,
      },
    },
    description: 'Multiple vehicle collision. Patient appears to have chest injuries and possible fractures.',
    symptoms: ['Chest Pain', 'Difficulty Breathing', 'Bleeding'],
  },
  {
    id: 'ER-2305-002',
    title: 'Unconscious Person at Central Plaza',
    status: 'assigned',
    severity: 2,
    reportedAt: '2025-03-15T10:05:43',
    patientName: 'Wanida Rakdee',
    contactNumber: '089-876-5432',
    emergencyType: 'Unconsciousness',
    location: {
      address: 'Central Plaza, 5th Floor, Food Court',
      coordinates: {
        lat: 13.8765,
        lng: 100.4321,
      },
    },
    assignedTo: 'Thonburi Hospital',
    description: 'Patient suddenly collapsed while eating. No visible injuries.',
    symptoms: ['Unconsciousness', 'Pallor'],
  },
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
      coordinates: {
        lat: 9.5678,
        lng: 100.0123,
      },
    },
    assignedTo: 'Samui International Hospital',
    description: 'Tourist found unconscious in hotel swimming pool. CPR in progress by hotel staff.',
    symptoms: ['Unconsciousness', 'Not Breathing', 'Cyanosis'],
  },
  {
    id: 'ER-2305-004',
    title: 'Elderly Fall at Bangkae Home',
    status: 'completed',
    severity: 2,
    reportedAt: '2025-03-15T08:45:00',
    patientName: 'Prasert Suksawat',
    contactNumber: '081-987-6543',
    emergencyType: 'Fall',
    location: {
      address: 'Bangkae Elderly Home, 123 Phetkasem Rd.',
      coordinates: {
        lat: 13.7123,
        lng: 100.4567,
      },
    },
    assignedTo: 'Siriraj Hospital',
    description: 'Elderly male fell in bathroom. Complaining of hip pain and unable to stand.',
    symptoms: ['Hip Pain', 'Limited Mobility', 'Bruising'],
  },
];

// Define counts for dashboard stats
const stats = {
  pending: emergencyCases.filter(c => c.status === 'pending').length,
  assigned: emergencyCases.filter(c => c.status === 'assigned').length,
  inProgress: emergencyCases.filter(c => c.status === 'in-progress').length,
  completed: emergencyCases.filter(c => c.status === 'completed').length,
  critical: emergencyCases.filter(c => c.severity === 4).length,
  total: emergencyCases.length,
}

export default function EmergencyCenterDashboard() {
  const [cases, setCases] = useState(emergencyCases);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Filter cases based on search query
  const filteredCases = cases.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignCase = (caseId: string) => {
    setCases(prev => 
      prev.map(c => 
        c.id === caseId 
          ? { ...c, status: 'assigned', assignedTo: 'Thonburi Hospital' } 
          : c
      )
    );
    
    toast({
      title: "Case assigned",
      description: `Case ${caseId} has been assigned to Thonburi Hospital.`,
    });
  };

  const handleCancelCase = (caseId: string) => {
    setCases(prev => 
      prev.map(c => 
        c.id === caseId 
          ? { ...c, status: 'cancelled' } 
          : c
      )
    );
    
    toast({
      title: "Case cancelled",
      description: `Case ${caseId} has been cancelled.`,
    });
  };

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

        {/* Stats Cards */}
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
                <div className="text-2xl font-bold">12</div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Hospital className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Cases List */}
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
            
            {['all', 'pending', 'assigned', 'in-progress', 'completed'].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                {filteredCases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">No cases found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredCases
                      .filter(c => tabValue === 'all' || c.status === tabValue)
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