'use client';

import React from 'react';
import { 
  Wind, 
  CloudRain, 
  Zap,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { DistrictHazard } from '../lib/types';

interface DisasterControlBarProps {
  districts: DistrictHazard[];
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  windSpeed: number;
  onWindSpeedChange: (speed: number) => void;
  rainfall: number;
  onRainfallChange: (rain: number) => void;
  eventType: string;
  onEventTypeChange: (type: string) => void;
  onTriggerEmergency: () => void;
  isProcessing: boolean;
  onApplyPreset: (preset: { district: string; wind: number; rain: number; type: string }) => void;
}

const PRESETS = [
  {
    label: 'Unseasonal Rains (Nashik - Grapes/Onion)',
    district: 'Nashik',
    wind: 65,
    rain: 140,
    type: 'Heavy Rain'
  },
  {
    label: 'Inundation Surge (Ludhiana - Wheat)',
    district: 'Ludhiana',
    wind: 45,
    rain: 160,
    type: 'Flash Flood'
  },
  {
    label: 'Super Cyclone (Coastal Belt - Paddy)',
    district: 'Puri',
    wind: 135,
    rain: 220,
    type: 'Cyclone'
  },
  {
    label: 'Gale Storm (Guntur - Chilli/Cotton)',
    district: 'Guntur',
    wind: 95,
    rain: 110,
    type: 'Cyclone'
  },
  {
    label: 'Monsoon Flood (Patna - Maize/Pulses)',
    district: 'Patna',
    wind: 35,
    rain: 185,
    type: 'Flash Flood'
  }
];

export const DisasterControlBar: React.FC<DisasterControlBarProps> = ({
  districts,
  selectedDistrict,
  onDistrictChange,
  windSpeed,
  onWindSpeedChange,
  rainfall,
  onRainfallChange,
  eventType,
  onEventTypeChange,
  onTriggerEmergency,
  isProcessing,
  onApplyPreset
}) => {
  return (
    <div className="surface-card p-5">
      {/* Header & Quick Preset Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Hazard Simulation & Automated Dispatch Controller</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure climate hazard parameters to trigger stage-specific farm advisories
          </p>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Scenarios:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onApplyPreset(p)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 items-end">
        {/* District Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Target Region / Agro-Zone
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            {districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.state || d.zone_type})
              </option>
            ))}
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Hazard Event Type
          </label>
          <select
            value={eventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="Cyclone">Cyclone / Gale Winds</option>
            <option value="Flash Flood">Flash Flood / Riverine Surge</option>
            <option value="Heavy Rain">Heavy Unseasonal Downpour</option>
            <option value="Hailstorm">Hailstorm & Squall</option>
          </select>
        </div>

        {/* Wind & Rain Sliders */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-slate-400" /> Wind Speed:
            </span>
            <span className="font-semibold text-white">{windSpeed} km/h</span>
          </div>
          <input
            type="range"
            min="20"
            max="180"
            value={windSpeed}
            onChange={(e) => onWindSpeedChange(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-slate-400" /> 24h Rain:
            </span>
            <span className="font-semibold text-white">{rainfall} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            value={rainfall}
            onChange={(e) => onRainfallChange(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        {/* Trigger Button */}
        <div>
          <button
            onClick={onTriggerEmergency}
            disabled={isProcessing}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 ${
              isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Running AI Advisory Pipeline...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Trigger Hyperlocal Advisory</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
