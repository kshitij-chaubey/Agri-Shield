'use client';

import React, { useState } from 'react';
import { 
  Send, 
  AlertTriangle, 
  Sprout, 
  PhoneCall, 
  Info
} from 'lucide-react';
import { GeneratedAdvisory, Farmer } from '../lib/types';

interface AdvisoryBreakdownCardProps {
  advisory: GeneratedAdvisory | null;
  farmer: Farmer | null;
  onDispatchAlert: (advisoryId: number, channels: string[]) => void;
  isDispatching: boolean;
}

export const AdvisoryBreakdownCard: React.FC<AdvisoryBreakdownCardProps> = ({
  advisory,
  farmer,
  onDispatchAlert,
  isDispatching
}) => {
  const [activeLangTab, setActiveLangTab] = useState<'hi' | 'en' | 'or'>('hi');

  if (!advisory) {
    return (
      <div className="surface-card p-6 flex flex-col items-center justify-center text-center h-[320px]">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <Sprout className="w-6 h-6 text-emerald-500/50" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">No Advisory Active</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select a hazard scenario above to generate stage-specific agronomist advice.
        </p>
      </div>
    );
  }

  const points = activeLangTab === 'hi' 
    ? (advisory.translated_points?.length ? advisory.translated_points : [advisory.translated_advisory])
    : activeLangTab === 'or'
    ? (advisory.translated_points?.length ? advisory.translated_points : [advisory.translated_advisory])
    : (advisory.english_points?.length ? advisory.english_points : [advisory.english_advisory]);

  return (
    <div className="surface-card p-5">
      {/* Target Farmer Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Farmer:</span>
            <span className="text-sm font-bold text-white">
              {advisory.farmer_name}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
              {advisory.district}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Crop: <strong className="text-slate-200">{advisory.crop_type}</strong> • Growth Stage: <strong className="text-indigo-400">{advisory.crop_stage}</strong>
          </p>
        </div>

        {/* Urgency Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 ${
            advisory.urgency_level === 'CRITICAL'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{advisory.urgency_level} PRIORITY</span>
          </span>
        </div>
      </div>

      {/* Language Switcher Tabs */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-300">
          3 Stage-Specific Field Interventions:
        </span>

        <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveLangTab('hi')}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
              activeLangTab === 'hi' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setActiveLangTab('en')}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
              activeLangTab === 'en' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setActiveLangTab('or')}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
              activeLangTab === 'or' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            ଓଡ଼ିଆ
          </button>
        </div>
      </div>

      {/* 3 Points */}
      <div className="space-y-2 mb-4">
        {points.map((point, index) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed"
          >
            <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              0{index + 1}
            </span>
            <p>{point}</p>
          </div>
        ))}
      </div>

      {/* Agronomist Rationale */}
      {advisory.reasoning && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 mb-4 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200 block mb-0.5">Agronomy Rationale:</strong>
            <span>{advisory.reasoning}</span>
          </div>
        </div>
      )}

      {/* Dispatch Action Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDispatchAlert(advisory.advisory_id, ['SMS', 'IVR'])}
          disabled={isDispatching}
          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isDispatching ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Dispatching...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch SMS & Automated IVR Voice Call</span>
            </>
          )}
        </button>

        <button
          onClick={() => onDispatchAlert(advisory.advisory_id, ['IVR'])}
          disabled={isDispatching}
          className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all flex items-center gap-1"
          title="Trigger Automated Voice Call Only"
        >
          <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
          <span>Call Only</span>
        </button>
      </div>
    </div>
  );
};
