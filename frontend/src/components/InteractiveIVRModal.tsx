'use client';

import React, { useState, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Volume2, 
  X, 
  Wifi, 
  ShieldAlert
} from 'lucide-react';
import { GeneratedAdvisory } from '../lib/types';
import { api } from '../lib/api';

interface InteractiveIVRModalProps {
  isOpen: boolean;
  onClose: () => void;
  advisory: GeneratedAdvisory | null;
  onReportDamage?: () => void;
}

export const InteractiveIVRModal: React.FC<InteractiveIVRModalProps> = ({
  isOpen,
  onClose,
  advisory,
  onReportDamage
}) => {
  const [callState, setCallState] = useState<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const [activeMessage, setActiveMessage] = useState<string>('');
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const audioUrl = advisory ? api.getAudioStreamUrl(advisory.audio_url || advisory.audio_filename) : '';

  const handleAnswerCall = () => {
    setCallState('CONNECTED');
    setActiveMessage('Playing emergency agricultural advisory broadcast...');
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio playback error:', e));
    }
  };

  const handleHangUp = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCallState('ENDED');
    setTimeout(() => {
      onClose();
      setCallState('RINGING');
      setPressedKey(null);
      setActiveMessage('');
    }, 1000);
  };

  const handleKeyPress = (digit: string) => {
    setPressedKey(digit);
    if (digit === '1') {
      setActiveMessage("🔁 Key '1' Pressed: Replaying advisory broadcast...");
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log(e));
      }
    } else if (digit === '2') {
      setActiveMessage("🚨 Key '2' Pressed: Crop Inundation report logged! Block Agronomist alerted.");
      onReportDamage?.();
    } else {
      setActiveMessage(`Key '${digit}' received.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}

      <div className="relative w-full max-w-sm rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 flex flex-col items-center justify-between min-h-[520px] text-white">
        {/* Top Status Bar */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>AgriShield Voice IVR</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Call Info */}
        <div className="text-center my-auto flex flex-col items-center w-full">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl mb-3">
            🌱
          </div>

          <h3 className="text-base font-bold text-white">
            AGRISHIELD DISASTER ADVISORY
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            +91 (Automated IVR System)
          </p>

          <div className="mt-3 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
            {callState === 'RINGING' && 'Incoming Advisory Call...'}
            {callState === 'CONNECTED' && '00:28 • Live Speech Stream'}
            {callState === 'ENDED' && 'Call Completed'}
          </div>

          {/* Connected Call Transcript */}
          {callState === 'CONNECTED' && (
            <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left text-xs space-y-2 w-full">
              <div className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>IVR Interactive Menu:</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                {advisory ? advisory.translated_advisory.slice(0, 100) + '...' : 'Agricultural hazard advisory.'}
              </p>
              <div className="pt-1.5 border-t border-slate-800 text-[11px] text-amber-400">
                👉 <strong>1:</strong> Replay Advice | <strong>2:</strong> Report Inundation
              </div>
              {activeMessage && (
                <div className="p-1.5 rounded bg-slate-950 text-[10px] text-slate-300 border border-slate-800">
                  {activeMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dialpad */}
        {callState === 'CONNECTED' && (
          <div className="grid grid-cols-3 gap-2 w-full max-w-[200px] mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeyPress(digit)}
                className={`w-12 h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex flex-col items-center justify-center border ${
                  pressedKey === digit ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-800'
                }`}
              >
                <span>{digit}</span>
              </button>
            ))}
          </div>
        )}

        {/* Call Action Buttons */}
        <div className="w-full flex items-center justify-around pt-2">
          {callState === 'RINGING' ? (
            <>
              <button
                onClick={handleHangUp}
                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow transition-all"
                title="Decline"
              >
                <PhoneOff className="w-5 h-5" />
              </button>

              <button
                onClick={handleAnswerCall}
                className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-all animate-pulse"
                title="Answer Call"
              >
                <Phone className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button
              onClick={handleHangUp}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow transition-all"
              title="Hang Up"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
