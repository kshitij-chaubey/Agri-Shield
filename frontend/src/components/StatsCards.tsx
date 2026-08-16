'use client';

import React from 'react';
import { 
  Users, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall,
  MapPin
} from 'lucide-react';
import { DashboardStats, SimulationResult } from '../lib/types';

interface StatsCardsProps {
  stats: DashboardStats | null;
  activeSimulation: SimulationResult | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, activeSimulation }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Active Threat Zone */}
      <div className="surface-card p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Active Hazard Zone</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
            activeSimulation?.warning_level === 'RED_ALERT'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {activeSimulation?.warning_level === 'RED_ALERT' ? 'Red Alert' : 'Active Monitor'}
          </span>
        </div>
        <div className="mt-3">
          <div className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{activeSimulation ? activeSimulation.district : 'Nashik, MH'}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">
            {activeSimulation ? activeSimulation.category : 'Severe Weather Risk Zone'}
          </p>
        </div>
      </div>

      {/* 2. Registered Farm Holdings */}
      <div className="surface-card p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Monitored Holdings</span>
          <Users className="w-4 h-4 text-slate-500" />
        </div>
        <div className="mt-3">
          <div className="text-xl font-bold text-white tracking-tight">
            {stats?.total_farmers ?? 8} <span className="text-xs font-normal text-slate-400">Profiles</span>
          </div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hyperlocal Geo-Mapped</span>
          </p>
        </div>
      </div>

      {/* 3. AI Advisories Synthesized */}
      <div className="surface-card p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Advisories Generated</span>
          <Volume2 className="w-4 h-4 text-slate-500" />
        </div>
        <div className="mt-3">
          <div className="text-xl font-bold text-white tracking-tight">
            {stats?.total_advisories ?? 0} <span className="text-xs font-normal text-slate-400">Audio Broadcasts</span>
          </div>
          <p className="text-xs text-indigo-400 mt-1 truncate">
            Hindi, English & Regional TTS
          </p>
        </div>
      </div>

      {/* 4. Telephony Dispatches */}
      <div className="surface-card p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Telephony Dispatches</span>
          <PhoneCall className="w-4 h-4 text-slate-500" />
        </div>
        <div className="mt-3">
          <div className="text-xl font-bold text-white tracking-tight">
            {stats?.total_dispatches ?? 0} <span className="text-xs font-normal text-slate-400">Alerts</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-slate-200 font-medium">{stats?.sms_count ?? 0} SMS</span>
            <span>•</span>
            <span className="text-slate-200 font-medium">{stats?.ivr_count ?? 0} Voice IVR</span>
          </p>
        </div>
      </div>
    </div>
  );
};
