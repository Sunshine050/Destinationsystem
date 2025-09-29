"use client"

import { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Calendar,
  ChevronsRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// เพิ่ม type CaseStatus ตรงนี้
export type CaseStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
export interface CaseCardProps {
  id: string;
  title: string;
  status: CaseStatus;
  severity: 1 | 2 | 3 | 4;
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
  description?: string;
  symptoms?: string[];
  onAssign?: () => void;
  onTransfer?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  role: 'emergency-center' | 'hospital' | 'rescue';
}

export default function CaseCard({
  id,
  title,
  status,
  severity,
  reportedAt,
  patientName,
  contactNumber,
  emergencyType,
  location,
  assignedTo,
  description,
  symptoms = [],
  onAssign,
  onTransfer,
  onComplete,
  onCancel,
  role,
}: CaseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 2:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500';
      case 3:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500';
      case 4:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1:
        return 'Mild';
      case 2:
        return 'Moderate';
      case 3:
        return 'Severe';
      case 4:
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'assigned':
        return 'Assigned';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 mb-1">
              <AlertTriangle className={cn("h-4 w-4", severity === 4 && "text-red-500")} />
              {title}
            </CardTitle>
            <CardDescription>Case ID: {id}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSeverityColor(severity)}>
              {getSeverityLabel(severity)}
            </Badge>
            <Badge className={getStatusColor(status)}>
              {getStatusLabel(status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Reported on {new Date(reportedAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <User className="mr-2 h-4 w-4" />
            <span>{patientName}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Phone className="mr-2 h-4 w-4" />
            <span>{contactNumber}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{location.address}</span>
          </div>
        </div>
        
        {expanded && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2 mb-3">
            <div className="text-sm">
              <span className="font-medium">Emergency Type:</span> {emergencyType}
            </div>
            {description && (
              <div className="text-sm">
                <span className="font-medium">Description:</span> {description}
              </div>
            )}
            {symptoms.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Symptoms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline">{symptom}</Badge>
                  ))}
                </div>
              </div>
            )}
            {assignedTo && (
              <div className="text-sm">
                <span className="font-medium">Assigned To:</span> {assignedTo}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-slate-500 dark:text-slate-400"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Less details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              More details
            </>
          )}
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <ChevronsRight className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className={cn("h-5 w-5", severity === 4 && "text-red-500")} />
                {title}
              </DialogTitle>
              <DialogDescription>
                Case ID: {id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
              <div className="flex gap-2">
                <Badge className={getSeverityColor(severity)}>
                  {getSeverityLabel(severity)}
                </Badge>
                <Badge className={getStatusColor(status)}>
                  {getStatusLabel(status)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Patient Information</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Name: {patientName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Contact: {contactNumber}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Incident Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <AlertTriangle className="mr-2 h-4 w-4 text-slate-500 mt-0.5" />
                    <span><strong>Emergency Type:</strong> {emergencyType}</span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="mr-2 h-4 w-4 text-slate-500 mt-0.5" />
                    <span><strong>Reported:</strong> {new Date(reportedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="mr-2 h-4 w-4 text-slate-500 mt-0.5" />
                    <span>
                      <strong>Location:</strong><br />
                      {location.address}<br />
                      Coordinates: {location.coordinates.lat}, {location.coordinates.lng}
                    </span>
                  </div>
                </div>
              </div>
              
              {(description || symptoms.length > 0) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Medical Information</p>
                    {description && (
                      <div className="text-sm">
                        <strong>Description:</strong>
                        <p className="mt-1">{description}</p>
                      </div>
                    )}
                    {symptoms.length > 0 && (
                      <div className="text-sm">
                        <strong>Symptoms:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {symptoms.map((symptom, index) => (
                            <Badge key={index} variant="outline">{symptom}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {assignedTo && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Assignment Information</p>
                    <div className="text-sm">
                      <strong>Assigned To:</strong> {assignedTo}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={onCancel}>
                {status === 'completed' ? 'Close' : 'Cancel Case'}
              </Button>
              <div className="space-x-2">
                {role === 'emergency-center' && status === 'pending' && (
                  <Button onClick={onAssign}>Assign to Hospital</Button>
                )}
                {role === 'hospital' && status === 'assigned' && (
                  <Button onClick={onTransfer}>Assign to Rescue Team</Button>
                )}
                {role === 'rescue' && status === 'in-progress' && (
                  <Button onClick={onComplete}>Complete Mission</Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}