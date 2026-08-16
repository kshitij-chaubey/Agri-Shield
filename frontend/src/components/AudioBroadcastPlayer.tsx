'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Radio
} from 'lucide-react';
import { GeneratedAdvisory } from '../lib/types';
import { api } from '../lib/api';

interface AudioBroadcastPlayerProps {
  advisory: GeneratedAdvisory | null;
  onLanguageChange?: (lang: 'hi' | 'en' | 'or') => void;
}

export const AudioBroadcastPlayer: React.FC<AudioBroadcastPlayerProps> = ({
  advisory,
  onLanguageChange
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en' | 'or'>('hi');

  useEffect(() => {
    if (advisory?.language) {
      setSelectedLang(advisory.language as any);
    }
  }, [advisory]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [advisory?.audio_url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.error("Audio playback error:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRateChange = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const audioStreamUrl = advisory ? api.getAudioStreamUrl(advisory.audio_url || advisory.audio_filename) : '';

  return (
    <div className="surface-card p-5">
      {/* Hidden Audio Element */}
      {audioStreamUrl && (
        <audio
          ref={audioRef}
          src={audioStreamUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header & Language Tabs */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            <span>Voice Broadcast Audio Stream</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Exact speech stream broadcasted via automated IVR voice telephony
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              setSelectedLang('hi');
              onLanguageChange?.('hi');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              selectedLang === 'hi'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => {
              setSelectedLang('en');
              onLanguageChange?.('en');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              selectedLang === 'en'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => {
              setSelectedLang('or');
              onLanguageChange?.('or');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              selectedLang === 'or'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ଓଡ଼ିଆ (Odia)
          </button>
        </div>
      </div>

      {/* Audio Player Container */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
        {advisory ? (
          <div className="space-y-3">
            {/* Audio Waveform Bars */}
            <div className="flex items-center justify-between gap-1 h-9 px-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              {[35, 60, 85, 40, 90, 25, 70, 80, 55, 40, 70, 85, 45, 65, 80, 30, 90, 65, 40, 75, 55, 85, 30, 70].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying 
                      ? 'bg-indigo-400' 
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (height * (0.6 + Math.random() * 0.6)))}%` : `${height * 0.35}%`
                  }}
                />
              ))}
            </div>

            {/* Scrubber */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono w-9">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs text-slate-400 font-mono w-9 text-right">
                {formatTime(duration || 30)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  onClick={handleRateChange}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800"
                >
                  {playbackRate}x
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Stream Ready
                </span>

                {audioStreamUrl && (
                  <a
                    href={audioStreamUrl}
                    download={advisory.audio_filename || "agrishield_advisory.mp3"}
                    className="p-1.5 px-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>MP3</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            Trigger an advisory scenario above to synthesize and stream voice audio broadcast
          </div>
        )}
      </div>
    </div>
  );
};
