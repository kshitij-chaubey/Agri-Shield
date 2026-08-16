'use client';

import React from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  Users, 
  Activity, 
  Sparkles,
  Wifi
} from 'lucide-react';

interface NavbarProps {
  onOpenFarmers: () => void;
  onOpenIVRSimulator: () => void;
  mockMode: boolean;
  totalFarmers: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenFarmers,
  onOpenIVRSimulator,
  mockMode,
  totalFarmers
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight text-base">
                AgriShield AI
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                v2.4 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Climate-Resilient Smart Agriculture Advisory & Multi-Channel IVR Dispatch
            </p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 mr-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open-Meteo Telemetry</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini Agronomist</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <Wifi className="w-3.5 h-3.5 text-sky-400" />
              <span>{mockMode ? 'Telephony: Sandbox' : 'Twilio: Live'}</span>
            </div>
          </div>

          {/* Interactive IVR Simulator Button */}
          <button
            onClick={onOpenIVRSimulator}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Test Phone Simulator</span>
          </button>

          {/* Farmers Directory */}
          <button
            onClick={onOpenFarmers}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all"
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Farmers ({totalFarmers})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
