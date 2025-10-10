"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapLocation {
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

export default function MapView({
  locations,
  selectedLocation,
  setSelectedLocation,
}: MapProps) {
  const getMarkerIcon = (severity: number) => {
    const colors: Record<number, string> = {
      1: "#4ade80", // Green
      2: "#fbbf24", // Yellow
      3: "#f97316", // Orange
      4: "#ef4444", // Red
    };

    return L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      shadowSize: [41, 41],
    });
  };

  return (
    <MapContainer
      center={{ lat: 13.7563, lng: 100.5018 }}
      zoom={10}
      style={{ width: "100%", height: "500px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.coordinates}
          icon={getMarkerIcon(loc.severity)}
          eventHandlers={{
            click: () => setSelectedLocation(loc),
          }}
        >
          <Popup>
            <div>
              <strong>{loc.title}</strong>
              <br />
              ผู้ป่วย: {loc.patientName}
              <br />
              สถานะ: {loc.status}
              <br />
              {loc.address}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
