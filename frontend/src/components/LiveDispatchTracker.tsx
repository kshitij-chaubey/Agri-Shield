'use client';

import React from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  RefreshCw, 
  Repeat,
  AlertOctagon
} from 'lucide-react';
import { DispatchLogItem } from '../lib/types';

interface LiveDispatchTrackerProps {
  logs: DispatchLogItem[];
  onSimulateKeyPress: (dispatchId: number, digit: string) => void;
  onRefresh: () => void;
  activeStage?: number; // 1 to 5
}

export const LiveDispatchTracker: React.FC<LiveDispatchTrackerProps> = ({
  logs,
  onSimulateKeyPress,
  onRefresh,
  activeStage = 5
}) => {
  const pipelineSteps = [
    { num: 1, label: 'Hazard Trigger' },
    { num: 2, label: 'Geo Matching' },
    { num: 3, label: 'AI Reasoning' },
    { num: 4, label: 'TTS Synthesis' },
    { num: 5, label: 'SMS & IVR' },
  ];

  return (
    <div className="surface-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Telephony Dispatch Stream & Interactive IVR Logs</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status tracking for SMS and Automated Voice Calls
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync</span>
        </button>
      </div>

      {/* 5-Step Pipeline Stepper */}
      <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-950 rounded-xl border border-slate-800 mb-4">
        {pipelineSteps.map((step) => {
          const isDone = activeStage >= step.num;
          return (
            <div
              key={step.num}
              className={`p-2 rounded-lg text-center transition-all ${
                isDone
                  ? 'bg-slate-900 border border-slate-700 text-white'
                  : 'text-slate-500 opacity-40'
              }`}
            >
              <div className="text-[10px] font-mono font-semibold">
                0{step.num}
              </div>
              <div className="text-[11px] font-medium truncate mt-0.5">
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Feed */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No dispatch events recorded. Trigger a disaster scenario above to start live telephony.
          </div>
        ) : (
          logs.map((log) => {
            const isIVR = log.channel === 'IVR';
            const isDamage = log.status === 'DAMAGE_REPORTED';
            const isReplay = log.status === 'REPLAY_REQUESTED';
            const isDelivered = log.status === 'DELIVERED' || log.status === 'ANSWERED';

            return (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 mt-0.5">
                    {isIVR ? <PhoneCall className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{log.farmer_name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{log.farmer_phone}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {log.district}
                      </span>
                    </div>

                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {log.channel} • {log.duration_seconds ? `${log.duration_seconds}s call • ` : ''}
                      {log.ivr_response || 'Delivered'}
                    </p>
                  </div>
                </div>

                {/* Status & DTMF Keypress Simulator Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                      isDamage
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : isReplay
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : isDelivered
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {log.status}
                  </span>

                  {isIVR && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSimulateKeyPress(log.id, '1')}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-mono flex items-center gap-1"
                        title="Simulate pressing Key 1 (Replay)"
                      >
                        <Repeat className="w-3 h-3 text-amber-400" />
                        <span>Key 1</span>
                      </button>
                      <button
                        onClick={() => onSimulateKeyPress(log.id, '2')}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-mono flex items-center gap-1"
                        title="Simulate pressing Key 2 (Report Damage)"
                      >
                        <AlertOctagon className="w-3 h-3 text-rose-400" />
                        <span>Key 2</span>
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                    {log.created_at}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
