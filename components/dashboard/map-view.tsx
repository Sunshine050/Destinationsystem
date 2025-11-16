// @components/dashboard/map-view.tsx
"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface MapLocation {
  id: string;
  title: string;
  severity: number;
  coordinates: { lat: number; lng: number };
  address: string;
  description: string;
  patientName: string;
  status: string;
}

interface MapProps {
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  setSelectedLocation: (loc: MapLocation | null) => void;
}

// ซูมไปที่ marker ที่เลือก
function FlyToMarker({ location }: { location: MapLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location.coordinates, 15, { animate: true });
    }
  }, [location, map]);
  return null;
}

// เก็บ map instance ด้วย useMap (ไม่ใช้ whenReady)
function MapInstance({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

export default function MapView({
  locations,
  selectedLocation,
  setSelectedLocation,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // ทำลาย map อย่างปลอดภัยเมื่อ unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (locations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">ไม่มีข้อมูลตำแหน่งให้แสดง</p>
      </div>
    );
  }

  return (
    <MapContainer
      key={locations.map(l => l.id).join("-")} // บังคับ re-create
      center={{ lat: 13.7563, lng: 100.5018 }}
      zoom={10}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapInstance mapRef={mapRef} />
      <FlyToMarker location={selectedLocation} />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.coordinates}
          icon={L.divIcon({
            html: `
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C10.5 2 6 6.5 6 12c0 10 10 18 10 18s10-8 10-18c0-5.5-4.5-10-10-10z" 
                      fill="${loc.severity === 4 ? '#ef4444' : loc.severity === 3 ? '#f97316' : loc.severity === 2 ? '#fbbf24' : '#4ade80'}" 
                      stroke="#fff" stroke-width="2"/>
                <circle cx="16" cy="12" r="4" fill="#fff"/>
              </svg>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            className: "custom-marker",
          })}
          eventHandlers={{
            click: () => {
              setSelectedLocation(loc);
              document.getElementById(`case-${loc.id}`)?.scrollIntoView({ behavior: "smooth" });
            },
          }}
          opacity={selectedLocation?.id === loc.id ? 1 : 0.8}
          zIndexOffset={selectedLocation?.id === loc.id ? 1000 : 0}
        >
          <Popup>
            <div className="p-1 text-xs">
              <strong>{loc.title}</strong>
              <br />
              ผู้ป่วย: {loc.patientName}
              <br />
              สถานะ: <span className="font-medium">{loc.status}</span>
              <br />
              {loc.address}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}