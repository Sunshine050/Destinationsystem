"use client"

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Ambulance, MapPin, Phone, Users, Activity } from 'lucide-react';

interface RescueTeam {
  id: string;
  name: string;
  status: 'available' | 'on-mission' | 'standby' | 'offline';
  members: number;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: string;
  vehicle: string;
  activeMission?: string;
  lastActive: string;
}

const rescueTeams: RescueTeam[] = [
  {
    id: 'RT-001',
    name: 'Rescue Team Alpha',
    status: 'available',
    members: 5,
    location: {
      address: 'Sukhumvit 24, Bangkok',
      coordinates: {
        lat: 13.7234,
        lng: 100.5678,
      },
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
      coordinates: {
        lat: 13.7245,
        lng: 100.5345,
      },
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
      coordinates: {
        lat: 13.7789,
        lng: 100.5432,
      },
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
      coordinates: {
        lat: 13.7456,
        lng: 100.5789,
      },
    },
    contact: '084-567-8901',
    vehicle: 'Ambulance D-4',
    lastActive: '2025-03-15T12:00:00',
  },
];

export default function RescueTeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = rescueTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'on-mission':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'standby':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500';
      case 'offline':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'on-mission':
        return 'On Mission';
      case 'standby':
        return 'On Standby';
      case 'offline':
        return 'Offline';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout role="hospital">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rescue Teams</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Monitor and coordinate with rescue teams
            </p>
          </div>
          <div className="flex gap-2">
            <Button>Contact All Teams</Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{rescueTeams.length}</div>
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                  <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Available Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {rescueTeams.filter(t => t.status === 'available').length}
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Ambulance className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                On Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {rescueTeams.filter(t => t.status === 'on-mission').length}
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {rescueTeams.reduce((acc, team) => acc + team.members, 0)}
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search teams..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Teams List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <Ambulance className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <p className="text-sm text-slate-500">{team.id}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(team.status)}>
                    {getStatusLabel(team.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Team Members
                    </p>
                    <p className="font-medium">{team.members} members</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Contact
                    </p>
                    <p className="font-medium">{team.contact}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </p>
                  <p className="font-medium">{team.location.address}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Vehicle</p>
                  <p className="font-medium">{team.vehicle}</p>
                </div>

                {team.activeMission && (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Active Mission</p>
                    <p className="font-medium">Case #{team.activeMission}</p>
                  </div>
                )}

                <div className="pt-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500">
                    Last active: {new Date(team.lastActive).toLocaleString()}
                  </p>
                  <Button variant="outline" size="sm">Contact Team</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}