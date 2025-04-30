"use client"

import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MapViewProps {
  locations?: Array<{
    id: string;
    title: string;
    severity: 1 | 2 | 3 | 4;
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  height?: string;
}

export default function MapView({
  locations = [],
  center = { lat: 13.7563, lng: 100.5018 }, // Bangkok by default
  zoom = 11,
  height = '400px',
}: MapViewProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // In a real implementation, this would load and initialize a map library like Google Maps
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return 'bg-green-500';
      case 2:
        return 'bg-amber-500';
      case 3:
        return 'bg-orange-500';
      case 4:
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div 
      className="bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden"
      style={{ height }}
    >
      {!isLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading map...</p>
          </div>
        </div>
      ) : locations.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p className="text-slate-500 dark:text-slate-400">
              No locations to display
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4386442/pexels-photo-4386442.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-50"></div>
          <div className="absolute inset-0 bg-white dark:bg-slate-900 opacity-50"></div>
          
          {/* Map Markers */}
          {locations.map((location) => (
            <div
              key={location.id}
              className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                // This would be calculated based on real map coordinates in a real implementation
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
            >
              <div className="relative group">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 ${getSeverityColor(location.severity)} rounded-full animate-ping absolute`}></div>
                  <div className={`w-4 h-4 ${getSeverityColor(location.severity)} rounded-full relative`}></div>
                  <div className="hidden group-hover:block absolute bottom-full mb-2 w-48 p-2 bg-white dark:bg-slate-800 rounded shadow-lg z-20">
                    <p className="font-semibold text-sm mb-1 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {location.title}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <Badge className="text-xs" variant="outline">{location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Map Controls */}
          <div className="absolute right-4 bottom-4 flex flex-col gap-2">
            <button className="w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow flex items-center justify-center text-slate-700 dark:text-slate-200">
              +
            </button>
            <button className="w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow flex items-center justify-center text-slate-700 dark:text-slate-200">
              -
            </button>
          </div>
        </>
      )}
    </div>
  );
}