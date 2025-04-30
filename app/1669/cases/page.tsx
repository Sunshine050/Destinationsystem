"use client"

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  Search,
  Filter,
  MapPin,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
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
  {
    id: 'ER-2305-006',
    title: 'Road Accident on Sukhumvit 24',
    status: 'pending',
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
    description: 'Motorcycle collision with car. Patient conscious but with leg injury and bleeding.',
    symptoms: ['Leg Pain', 'Bleeding', 'Abrasions'],
  },
  {
    id: 'ER-2305-007',
    title: 'Heart Attack at Fitness Center',
    status: 'pending',
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
    description: 'Middle-aged male collapsed during workout with chest pain and shortness of breath.',
    symptoms: ['Chest Pain', 'Shortness of Breath', 'Sweating'],
  },
];

export default function EmergencyCenterCases() {
  const [cases, setCases] = useState(emergencyCases);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    date: 'all',
  });
  const { toast } = useToast();

  // Filter cases based on search query and filters
  const filteredCases = cases.filter(c => {
    // Search filter
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = filters.status === 'all' || c.status === filters.status;
    
    // Severity filter
    const matchesSeverity = filters.severity === 'all' || c.severity.toString() === filters.severity;
    
    // Date filter (simplified - in real app would use proper date filtering)
    const matchesDate = filters.date === 'all';
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesDate;
  });

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

  const getMapLocations = () => {
    return filteredCases.map(c => ({
      id: c.id,
      title: c.title,
      severity: c.severity as 1 | 2 | 3 | 4,
      coordinates: c.location.coordinates
    }));
  };

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

        {/* Filters */}
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
              onValueChange={(value) => setFilters({...filters, status: value})}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.severity}
              onValueChange={(value) => setFilters({...filters, severity: value})}
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
                  onCheckedChange={() => setFilters({...filters, date: 'all'})}
                >
                  All Dates
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === 'today'}
                  onCheckedChange={() => setFilters({...filters, date: 'today'})}
                >
                  Today
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === 'yesterday'}
                  onCheckedChange={() => setFilters({...filters, date: 'yesterday'})}
                >
                  Yesterday
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === 'week'}
                  onCheckedChange={() => setFilters({...filters, date: 'week'})}
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

        {/* Stats Summary */}
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
                {filteredCases.filter(c => c.status === 'pending').length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical</p>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                {filteredCases.filter(c => c.severity === 4).length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                {filteredCases.filter(c => c.status === 'completed').length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cases List or Map View */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredCases.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">No cases found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCases.map((emergencyCase) => (
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
          </div>
        ) : (
          <div className="space-y-4">
            <MapView
              locations={getMapLocations()}
              height="500px"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Showing {filteredCases.length} emergency cases on the map. Hover over markers for details.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}