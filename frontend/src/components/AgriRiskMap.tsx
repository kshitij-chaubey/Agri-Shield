'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DistrictHazard, Farmer, SimulationResult } from '../lib/types';
import { MapPin, Navigation, Wind } from 'lucide-react';

interface AgriRiskMapProps {
  districts: DistrictHazard[];
  farmers: Farmer[];
  activeSimulation: SimulationResult | null;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  onQuickSimulateFarmer: (farmer: Farmer) => void;
}

export const AgriRiskMap: React.FC<AgriRiskMapProps> = ({
  districts,
  farmers,
  activeSimulation,
  selectedDistrict,
  onSelectDistrict,
  onQuickSimulateFarmer
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    const initMap = async () => {
      L = (await import('leaflet')).default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Center on India agricultural expanse
      const map = L.map(mapContainerRef.current, {
        center: [21.5, 80.0],
        zoom: 5.2,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map overlays
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    
    import('leaflet').then((LModule) => {
      const L = LModule.default;
      const map = mapInstanceRef.current;

      map.eachLayer((layer: any) => {
        if (layer instanceof L.Circle || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // 1. Regional Hazard Zones
      districts.forEach((dist) => {
        const isTarget = activeSimulation?.district.toLowerCase() === dist.name.toLowerCase();
        const dangerColor = isTarget
          ? (activeSimulation?.warning_level === 'RED_ALERT' ? '#f43f5e' : '#f59e0b')
          : '#64748b';

        const radius = isTarget ? 65000 : 35000;
        
        const circle = L.circle([dist.latitude, dist.longitude], {
          color: dangerColor,
          fillColor: dangerColor,
          fillOpacity: isTarget ? 0.3 : 0.1,
          weight: isTarget ? 2 : 1,
          dashArray: isTarget ? undefined : '4, 4',
          radius: radius
        }).addTo(map);

        circle.on('click', () => {
          onSelectDistrict(dist.name);
        });

        // District Tag Marker
        const districtIcon = L.divIcon({
          className: 'custom-district-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2">
              <div class="w-6 h-6 rounded-full ${isTarget ? 'bg-rose-500' : 'bg-slate-800'} border-2 ${isTarget ? 'border-white' : 'border-slate-600'} flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                ${dist.name.slice(0, 2).toUpperCase()}
              </div>
              <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-medium text-slate-200 shadow">
                ${dist.name} ${dist.state ? `(${dist.state})` : ''}
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([dist.latitude, dist.longitude], { icon: districtIcon }).addTo(map);
        marker.on('click', () => {
          onSelectDistrict(dist.name);
        });
      });

      // 2. Farmer Location Pins
      farmers.forEach((farmer) => {
        if (!farmer.latitude || !farmer.longitude) return;

        const isAffected = activeSimulation?.district.toLowerCase() === farmer.district.toLowerCase();

        const farmerIcon = L.divIcon({
          className: 'farmer-pin',
          html: `
            <div class="relative cursor-pointer transform -translate-x-1/2 -translate-y-1/2">
              <div class="w-5 h-5 rounded-md ${isAffected ? 'bg-amber-500' : 'bg-emerald-600'} border border-white flex items-center justify-center text-white text-[10px] shadow">
                🌱
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const farmerMarker = L.marker([farmer.latitude, farmer.longitude], { icon: farmerIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: inherit; font-size: 11px; line-height: 1.4; min-width: 190px;">
            <div style="font-weight: 700; font-size: 13px; color: #10b981; margin-bottom: 2px;">${farmer.name}</div>
            <div style="color: #94a3b8;">📍 Region: <strong>${farmer.district}</strong></div>
            <div style="color: #cbd5e1;">🌾 Crop: <strong>${farmer.crop_type}</strong> (${farmer.crop_stage})</div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 4px;">Soil: ${farmer.soil_type} | 📱 ${farmer.phone}</div>
          </div>
        `;

        farmerMarker.bindPopup(popupContent);
      });
    });
  }, [mapLoaded, districts, farmers, activeSimulation, selectedDistrict]);

  return (
    <div className="surface-card p-4 sm:p-5 flex flex-col h-[500px] relative overflow-hidden">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3 z-10">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>Geospatial Farmland & Climate Hazard Telemetry</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time agro-climatic zones and geo-mapped farm holdings
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Hazard Alert</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
            <span>Farm Pin</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 w-full rounded-xl overflow-hidden border border-slate-800">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Weather Overlay */}
        <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 rounded-xl p-3 border border-slate-700 max-w-xs shadow-lg backdrop-blur-sm text-xs">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="font-semibold text-white flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-indigo-400" />
              {activeSimulation?.district || selectedDistrict} Radar
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Wind Velocity</span>
              <span className="font-semibold text-white">
                {activeSimulation?.wind_speed_kmh || 65} km/h
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">24h Rainfall</span>
              <span className="font-semibold text-white">
                {activeSimulation?.rainfall_mm || 140} mm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
