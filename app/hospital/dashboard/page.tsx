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
  Ambulance,
  Clock,
  Heart,
  Users,
  Search,
  Activity
} from 'lucide-react';
import CaseCard from '@/components/dashboard/case-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Emergency cases sample data - hospital view
const hospitalCases = [
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
  {
    id: 'ER-2305-005',
    title: 'Stroke Symptoms at Office Building',
    status: 'assigned',
    severity: 3,
    reportedAt: '2025-03-15T12:30:15',
    patientName: 'Somying Jaidee',
    contactNumber: '085-123-4567',
    emergencyType: 'Stroke',
    location: {
      address: 'SCB Park Plaza, 12th Floor, Ratchadapisek Rd.',
      coordinates: {
        lat: 13.8123,
        lng: 100.5678,
      },
    },
    assignedTo: 'Thonburi Hospital',
    description: 'Female patient with sudden facial drooping and slurred speech during meeting.',
    symptoms: ['Facial Drooping', 'Slurred Speech', 'Arm Weakness'],
  },
];

// Define counts for dashboard stats
const stats = {
  assigned: hospitalCases.filter(c => c.status === 'assigned').length,
  inProgress: hospitalCases.filter(c => c.status === 'in-progress').length,
  completed: hospitalCases.filter(c => c.status === 'completed').length,
  critical: hospitalCases.filter(c => c.severity === 4).length,
  total: hospitalCases.length,
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
}

export default function HospitalDashboard() {
  const [cases, setCases] = useState(hospitalCases);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Filter cases based on search query
  const filteredCases = cases.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTransferCase = (caseId: string) => {
    setCases(prev => 
      prev.map(c => 
        c.id === caseId 
          ? { ...c, status: 'in-progress', assignedTo: 'Rescue Team Alpha' } 
          : c
      )
    );
    
    toast({
      title: "Case transferred",
      description: `Case ${caseId} has been assigned to Rescue Team Alpha.`,
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
    <DashboardLayout role="hospital">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Monitor emergency cases and hospital resources
            </p>
          </div>
          <div className="flex gap-2">
            <Button>Hospital Status Update</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Assigned Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.assigned}</div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-500" />
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
                Available Beds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.beds.available}</div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Heart className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Resources</CardTitle>
              <CardDescription>Current capacity and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">General Beds</span>
                    <span className="text-sm text-slate-500">
                      {stats.beds.occupied - stats.beds.icu.occupied}/{stats.beds.total - stats.beds.icu.total}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${((stats.beds.occupied - stats.beds.icu.occupied) / (stats.beds.total - stats.beds.icu.total)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">ICU Beds</span>
                    <span className="text-sm text-slate-500">
                      {stats.beds.icu.occupied}/{stats.beds.icu.total}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${(stats.beds.icu.occupied / stats.beds.icu.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Emergency Staff</span>
                    <span className="text-sm text-slate-500">15/20</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${(15 / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Ambulances</span>
                    <span className="text-sm text-slate-500">3/8</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${(3 / 8) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rescue Teams</CardTitle>
              <CardDescription>Active teams and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <Ambulance className="h-5 w-5 text-green-600 dark:text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Team Alpha</p>
                      <p className="text-sm text-slate-500">Ambulance A-1</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500">
                    Available
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                      <Ambulance className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">Team Bravo</p>
                      <p className="text-sm text-slate-500">Ambulance B-2</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500">
                    On Standby
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                      <Ambulance className="h-5 w-5 text-red-600 dark:text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">Team Charlie</p>
                      <p className="text-sm text-slate-500">Ambulance C-3</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500">
                    On Mission
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium">Emergency Staff</p>
                      <p className="text-sm text-slate-500">On-call personnel</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">15 available</div>
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
            
            {['all', 'assigned', 'in-progress', 'completed'].map((tabValue) => (
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
                          onTransfer={() => handleTransferCase(emergencyCase.id)}
                          onCancel={() => handleCancelCase(emergencyCase.id)}
                          role="hospital"
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