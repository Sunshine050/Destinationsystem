"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Phone, 
  MapPin, 
  ArrowLeft,
  Search,
  Plus,
  AlertTriangle,
  Bed,
  Activity,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Example hospital data - in a real app, this would come from an API or database
const hospitals = [
  {
    id: 1,
    name: "Central Hospital",
    address: "123 Medical Center Drive",
    phone: "+66 2 123 4567",
    status: "active",
    capacity: {
      icu: {
        total: 5,
        available: 2
      },
      emergency: {
        total: 10,
        available: 4
      },
      general: {
        total: 50,
        available: 15
      }
    },
    staff: {
      doctors: 20,
      nurses: 45,
      available: 12
    }
  },
  {
    id: 2,
    name: "City General Hospital",
    address: "456 Healthcare Avenue",
    phone: "+66 2 234 5678",
    status: "busy",
    capacity: {
      icu: {
        total: 8,
        available: 1
      },
      emergency: {
        total: 15,
        available: 2
      },
      general: {
        total: 75,
        available: 8
      }
    },
    staff: {
      doctors: 30,
      nurses: 60,
      available: 15
    }
  },
  {
    id: 3,
    name: "Metropolitan Medical Center",
    address: "789 Wellness Boulevard",
    phone: "+66 2 345 6789",
    status: "available",
    capacity: {
      icu: {
        total: 12,
        available: 4
      },
      emergency: {
        total: 20,
        available: 7
      },
      general: {
        total: 100,
        available: 25
      }
    },
    staff: {
      doctors: 40,
      nurses: 80,
      available: 22
    }
  }
];

export default function HospitalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'busy':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500';
      case 'available':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleContactHospital = (hospitalId: number) => {
    toast({
      title: "Contacting Hospital",
      description: "Establishing communication with hospital staff...",
    });
  };

  const handleUpdateStatus = (hospitalId: number) => {
    toast({
      title: "Status Updated",
      description: "Hospital status has been updated successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connected Hospitals</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monitor and manage hospital network
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search hospitals..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Hospital
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Hospitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Available ICU Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospitals.reduce((sum, h) => sum + h.capacity.icu.available, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Emergency Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospitals.reduce((sum, h) => sum + h.capacity.emergency.available, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Available Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospitals.reduce((sum, h) => sum + h.staff.available, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle>{hospital.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(hospital.status)}>
                  {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {hospital.address}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {hospital.phone}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Bed className="h-4 w-4" />
                      ICU Beds
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span className="font-medium">{hospital.capacity.icu.available}/{hospital.capacity.icu.total}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(hospital.capacity.icu.available / hospital.capacity.icu.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      Emergency
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span className="font-medium">{hospital.capacity.emergency.available}/{hospital.capacity.emergency.total}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${(hospital.capacity.emergency.available / hospital.capacity.emergency.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      Staff
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span className="font-medium">{hospital.staff.available}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(hospital.staff.available / (hospital.staff.doctors + hospital.staff.nurses)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleContactHospital(hospital.id)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleUpdateStatus(hospital.id)}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}