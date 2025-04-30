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
  MapPin,
  Clock,
  Users,
  Search,
  Activity
} from 'lucide-react';
import CaseCard from '@/components/dashboard/case-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Emergency cases sample data - rescue team view
const rescueCases = [
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
      coordinates: {
        lat: 13.7234,
        lng: 100.5678,
      },
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
      coordinates: {
        lat: 13.7234,
        lng: 100.5288,
      },
    },
    assignedTo: 'Rescue Team Charlie',
    description: 'Middle-aged male collapsed during workout with chest pain and shortness of breath.',
    symptoms: ['Chest Pain', 'Shortness of Breath', 'Sweating'],
  },
];

// Define counts for dashboard stats
const stats = {
  inProgress: rescueCases.filter(c => c.status === 'in-progress').length,
  completed: rescueCases.filter(c => c.status === 'completed').length,
  critical: rescueCases.filter(c => c.severity === 4).length,
  total: rescueCases.length,
}

export default function RescueTeamDashboard() {
  const [cases, setCases] = useState(rescueCases);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Filter cases based on search query
  const filteredCases = cases.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCompleteCase = (caseId: string) => {
    setCases(prev => 
      prev.map(c => 
        c.id === caseId 
          ? { ...c, status: 'completed' } 
          : c
      )
    );
    
    toast({
      title: "Mission completed",
      description: `Case ${caseId} has been successfully completed.`,
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
      title: "Mission cancelled",
      description: `Case ${caseId} has been cancelled.`,
    });
  };

  return (
    <DashboardLayout role="rescue">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rescue Team Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage and track rescue missions
            </p>
          </div>
          <div className="flex gap-2">
            <Button>Update Team Status</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Active Missions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Critical Cases
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
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">5</div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Status */}
        <Card>
          <CardHeader>
            <CardTitle>Team Status & Location</CardTitle>
            <CardDescription>Current team position and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">
                  Map view will be displayed here
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Status</h3>
                <p className="text-green-600 dark:text-green-500 font-medium">Available for Missions</p>
                <p className="text-sm text-slate-500 mt-1">Updated 5 minutes ago</p>
              </div>
              <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Location</h3>
                <p className="text-blue-600 dark:text-blue-500 font-medium">Sukhumvit 24, Bangkok</p>
                <p className="text-sm text-slate-500 mt-1">3 km from hospital</p>
              </div>
              <div className="flex-1 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Team Members</h3>
                <p className="text-purple-600 dark:text-purple-500 font-medium">All members on duty</p>
                <p className="text-sm text-slate-500 mt-1">5/5 team members available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Cases List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-xl font-bold">Rescue Missions</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="Search missions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Missions</TabsTrigger>
              <TabsTrigger value="in-progress">
                Active <Badge className="ml-1">{stats.inProgress}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed <Badge className="ml-1">{stats.completed}</Badge>
              </TabsTrigger>
            </TabsList>
            
            {['all', 'in-progress', 'completed'].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                {filteredCases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">No missions found</p>
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
                          onComplete={() => handleCompleteCase(emergencyCase.id)}
                          onCancel={() => handleCancelCase(emergencyCase.id)}
                          role="rescue"
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