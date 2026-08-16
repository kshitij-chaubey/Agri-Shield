'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DistrictHazard, Farmer, SimulationResult } from '../lib/types';
import { MapPin, AlertCircle, Wind, CloudRain, Shield, Navigation } from 'lucide-react';

interface OdishaRiskMapProps {
  districts: DistrictHazard[];
  farmers: Farmer[];
  activeSimulation: SimulationResult | null;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  onQuickSimulateFarmer: (farmer: Farmer) => void;
}

export const OdishaRiskMap: React.FC<OdishaRiskMapProps> = ({
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

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Center on Odisha: 20.9517° N, 85.0985° E
      const map = L.map(mapContainerRef.current, {
        center: [20.45, 85.6],
        zoom: 7.4,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Dark futuristic Map Tiles (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Odisha State Remote Sensing',
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

  // Update District Risk Circles and Farmer Markers when data changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    
    import('leaflet').then((LModule) => {
      const L = LModule.default;
      const map = mapInstanceRef.current;

      // Clear existing overlays
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Circle || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // 1. Draw District Risk Zones
      districts.forEach((dist) => {
        const isTarget = activeSimulation?.district.toLowerCase() === dist.name.toLowerCase();
        const isSelected = selectedDistrict.toLowerCase() === dist.name.toLowerCase();

        const dangerColor = isTarget
          ? (activeSimulation?.warning_level === 'RED_ALERT' ? '#ef4444' : '#f59e0b')
          : (dist.cyclone_vulnerability === 'Extreme' ? '#f43f5e' : dist.cyclone_vulnerability === 'Very High' ? '#fb923c' : '#38bdf8');

        // Outer threat radius
        const radius = isTarget ? 38000 : 22000;
        
        const circle = L.circle([dist.latitude, dist.longitude], {
          color: dangerColor,
          fillColor: dangerColor,
          fillOpacity: isTarget ? 0.35 : 0.15,
          weight: isTarget ? 3 : 1.5,
          dashArray: isTarget ? undefined : '4, 6',
          radius: radius
        }).addTo(map);

        circle.on('click', () => {
          onSelectDistrict(dist.name);
        });

        // District Label & Marker
        const districtIcon = L.divIcon({
          className: 'custom-district-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group">
              <div class="w-8 h-8 rounded-full ${isTarget ? 'bg-red-500 animate-pulse-ring' : 'bg-slate-900/90'} border-2 ${isTarget ? 'border-red-400' : 'border-cyan-400'} flex items-center justify-center text-white shadow-xl shadow-cyan-500/20">
                <span class="text-[10px] font-bold">${dist.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-slate-900/95 border border-slate-700 text-[11px] font-semibold text-slate-200 shadow-md">
                ${dist.name} ${isTarget ? '🚨' : ''}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([dist.latitude, dist.longitude], { icon: districtIcon }).addTo(map);
        marker.on('click', () => {
          onSelectDistrict(dist.name);
        });
      });

      // 2. Plot Registered Farmers with Hyperlocal Pins
      farmers.forEach((farmer) => {
        if (!farmer.latitude || !farmer.longitude) return;

        const isAffected = activeSimulation?.district.toLowerCase() === farmer.district.toLowerCase();

        const farmerIcon = L.divIcon({
          className: 'farmer-pin',
          html: `
            <div class="relative cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group">
              <div class="w-7 h-7 rounded-lg ${isAffected ? 'bg-amber-500 border-2 border-white' : 'bg-emerald-600 border-2 border-emerald-300'} flex items-center justify-center text-white shadow-lg">
                <span class="text-[12px]">🌾</span>
              </div>
              ${isAffected ? '<span class="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span></span>' : ''}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const farmerMarker = L.marker([farmer.latitude, farmer.longitude], { icon: farmerIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 200px;">
            <div style="font-weight: 700; font-size: 14px; color: #10b981; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
              <span>${farmer.name}</span>
              <span style="font-size: 10px; background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 6px; border-radius: 4px;">${farmer.language === 'or' ? 'Odia' : 'Hindi'}</span>
            </div>
            <div style="color: #cbd5e1; margin-bottom: 2px;">📍 <strong>District:</strong> ${farmer.district}</div>
            <div style="color: #cbd5e1; margin-bottom: 2px;">🌱 <strong>Crop:</strong> ${farmer.crop_type} (${farmer.crop_stage})</div>
            <div style="color: #cbd5e1; margin-bottom: 6px;">🌍 <strong>Soil:</strong> ${farmer.soil_type} | 📱 ${farmer.phone}</div>
            <div style="color: #f59e0b; font-size: 11px; font-weight: 600; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
              ${isAffected ? '⚠️ Direct Cyclone Hazard Path!' : '✓ Normal Alert Monitoring'}
            </div>
          </div>
        `;

        farmerMarker.bindPopup(popupContent);
      });
    });
  }, [mapLoaded, districts, farmers, activeSimulation, selectedDistrict]);

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col h-[520px] relative overflow-hidden">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Odisha Coastal Hazard & Farmland Geospatial Map</span>
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              Live GIS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Bay of Bengal cyclonic tracking & geo-mapped farmer coordinates
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-300"></span>
            <span>Super Cyclone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-300"></span>
            <span>Flood Alert</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-lg bg-emerald-600 flex items-center justify-center text-[8px]">🌾</span>
            <span>Farmer Pin</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative flex-1 w-full rounded-2xl overflow-hidden border border-slate-800">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Weather Overlay Badge on Map */}
        <div className="absolute top-3 right-3 z-[1000] glass-panel rounded-xl p-3 border border-slate-700/80 max-w-xs shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1.5 mb-1.5">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" />
              {activeSimulation?.district || selectedDistrict} Radar
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold uppercase">
              {activeSimulation?.warning_level || 'IMD Monitor'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Sustained Wind</span>
              <span className="font-bold text-white text-sm">
                {activeSimulation?.wind_speed_kmh || 120} <span className="text-[10px] text-slate-400 font-normal">km/h</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Rainfall</span>
              <span className="font-bold text-white text-sm">
                {activeSimulation?.rainfall_mm || 180} <span className="text-[10px] text-slate-400 font-normal">mm</span>
              </span>
            </div>
          </div>
          {activeSimulation?.storm_surge_meters ? (
            <div className="mt-2 pt-1.5 border-t border-slate-700/40 text-[11px] text-red-400 flex items-center gap-1">
              <span>🌊 Storm Surge: <strong>{activeSimulation.storm_surge_meters}m</strong> above astronomical tide</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
