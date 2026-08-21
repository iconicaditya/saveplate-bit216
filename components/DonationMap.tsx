"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, User, Package } from "lucide-react";

// Fix Leaflet's default icon issue with Next.js/Webpack
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export type MapLocation = {
  id: string;
  lat: number;
  lng: number;
  itemName: string;
  donorName: string;
  category: string;
  pickupLocation: string;
  distance: string;
};

interface DonationMapProps {
  locations: MapLocation[];
  onClaim: (id: string) => void;
}

export default function DonationMap({ locations, onClaim }: DonationMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl border border-gray-200" />;
  }

  // Center roughly in New York for sample data
  const center: [number, number] = [40.7128, -74.0060];

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup className="saveplate-popup">
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-gray-900 text-base mb-2 pb-2 border-b border-gray-100">{loc.itemName}</h3>

                <div className="space-y-1.5 mb-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="w-3.5 h-3.5 mr-2 shrink-0 text-gray-400" />
                    <span>{loc.donorName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Package className="w-3.5 h-3.5 mr-2 shrink-0 text-gray-400" />
                    <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">{loc.category}</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 shrink-0 text-gray-400" />
                    <span className="leading-tight">{loc.pickupLocation} <br/><span className="text-xs text-gray-400">({loc.distance} away)</span></span>
                  </div>
                </div>

                <button
                  onClick={() => onClaim(loc.id)}
                  className="w-full bg-[#4CAF50] hover:bg-[#3d8c40] text-white font-medium py-1.5 rounded transition-colors text-sm"
                >
                  Claim Item
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}