'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  Users, 
  Activity, 
  Sparkles,
  Wifi,
  Globe,
  Settings,
  X,
  Check
} from 'lucide-react';
import { api } from '../lib/api';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('AGRISHIELD_BACKEND_URL') || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      setBackendUrl(saved.replace(/\/api\/?$/, ''));
    }
  }, [isSettingsOpen]);

  const handleSaveBackendUrl = (e: React.FormEvent) => {
    e.preventDefault();
    api.setCustomBackendUrl(backendUrl.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSettingsOpen(false);
      window.location.reload();
    }, 800);
  };

  return (
    <>
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
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 mr-1">
              <div 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                title="Configure Backend Connection"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Telemetry Stream</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gemini 2.5 Flash</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                <span>{mockMode ? 'Sandbox IVR' : 'Twilio Live'}</span>
              </div>
            </div>

            {/* Backend URL Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
              title="Configure Backend Connection URL"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Interactive IVR Simulator Button */}
            <button
              onClick={onOpenIVRSimulator}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Phone Simulator</span>
            </button>

            {/* Farmers Directory */}
            <button
              onClick={onOpenFarmers}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Farmers ({totalFarmers})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Backend URL Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Backend Connection Configuration</span>
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBackendUrl} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  FastAPI Backend Server Base URL
                </label>
                <input
                  type="url"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="https://your-backend.onrender.com or http://127.0.0.1:8000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter your deployed backend URL (Render, Railway, EC2) or local address.
                </p>
              </div>

              {savedSuccess && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Connection URL updated! Reloading...</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    api.setCustomBackendUrl('');
                    window.location.reload();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-xs text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                >
                  Reset to Default
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
