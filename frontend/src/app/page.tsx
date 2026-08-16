'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Farmer, 
  DistrictHazard, 
  SimulationResult, 
  GeneratedAdvisory, 
  DispatchLogItem, 
  DashboardStats 
} from '../lib/types';
import { api } from '../lib/api';

import { Navbar } from '../components/Navbar';
import { StatsCards } from '../components/StatsCards';
import { AgriRiskMap } from '../components/AgriRiskMap';
import { DisasterControlBar } from '../components/DisasterControlBar';
import { AudioBroadcastPlayer } from '../components/AudioBroadcastPlayer';
import { AdvisoryBreakdownCard } from '../components/AdvisoryBreakdownCard';
import { LiveDispatchTracker } from '../components/LiveDispatchTracker';
import { InteractiveIVRModal } from '../components/InteractiveIVRModal';
import { FarmerDirectoryModal } from '../components/FarmerDirectoryModal';

export default function DashboardPage() {
  // Global Data State
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [districts, setDistricts] = useState<DistrictHazard[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dispatches, setDispatches] = useState<DispatchLogItem[]>([]);
  const [health, setHealth] = useState<{ status: string; mock_telephony: boolean } | null>(null);

  // Simulation & Pipeline State
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Nashik');
  const [windSpeed, setWindSpeed] = useState<number>(65);
  const [rainfall, setRainfall] = useState<number>(140);
  const [eventType, setEventType] = useState<string>('Heavy Rain');
  const [activeSimulation, setActiveSimulation] = useState<SimulationResult | null>(null);
  const [activeAdvisory, setActiveAdvisory] = useState<GeneratedAdvisory | null>(null);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [pipelineStage, setPipelineStage] = useState<number>(5);

  // Loading States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Modals
  const [isFarmersModalOpen, setIsFarmersModalOpen] = useState<boolean>(false);
  const [isIVRModalOpen, setIsIVRModalOpen] = useState<boolean>(false);

  // Initial Load
  const loadInitialData = useCallback(async () => {
    try {
      const [farmersData, districtsData, statsData, dispatchesData, healthData] = await Promise.allSettled([
        api.getFarmers(),
        api.getDistricts(),
        api.getStats(),
        api.getLiveDispatches(20),
        api.getHealth()
      ]);

      if (farmersData.status === 'fulfilled') setFarmers(farmersData.value);
      if (districtsData.status === 'fulfilled') setDistricts(districtsData.value);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (dispatchesData.status === 'fulfilled') setDispatches(dispatchesData.value);
      if (healthData.status === 'fulfilled') setHealth(healthData.value);
    } catch (e) {
      console.error('Failed loading initial data:', e);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(() => {
      api.getLiveDispatches(20).then(setDispatches).catch(() => {});
      api.getStats().then(setStats).catch(() => {});
    }, 12000);
    return () => clearInterval(interval);
  }, [loadInitialData]);

  // Apply Quick Preset
  const handleApplyPreset = (preset: { district: string; wind: number; rain: number; type: string }) => {
    setSelectedDistrict(preset.district);
    setWindSpeed(preset.wind);
    setRainfall(preset.rain);
    setEventType(preset.type);
  };

  // Trigger Advisory Pipeline
  const handleTriggerEmergency = async () => {
    setIsProcessing(true);
    setPipelineStage(1);

    try {
      // 1. Simulate Hazard
      setPipelineStage(1);
      const simRes = await api.simulateDisaster({
        district: selectedDistrict,
        wind_speed_kmh: windSpeed,
        rainfall_mm: rainfall,
        event_type: eventType
      });
      setActiveSimulation(simRes.simulation);

      // 2. Match Farmers
      setPipelineStage(2);
      await new Promise((r) => setTimeout(r, 350));
      const affected = simRes.affected_farmers;
      const target = (affected && affected.length > 0) ? affected[0] : (farmers[0] || null);
      setSelectedFarmer(target);

      // 3. Generate Advisory & AI Reasoning
      setPipelineStage(3);
      await new Promise((r) => setTimeout(r, 450));
      const advRes = await api.generateAdvisory({
        farmer_id: target?.id,
        farmer_name: target?.name || 'Regional Farmer',
        district: selectedDistrict,
        crop_type: target?.crop_type || 'Crop',
        crop_stage: target?.crop_stage || 'Harvest-Ready',
        soil_type: target?.soil_type || 'Alluvial',
        language: target?.language || 'hi',
        event_type: eventType,
        wind_speed_kmh: windSpeed,
        rainfall_mm: rainfall
      });
      setActiveAdvisory(advRes);

      // 4. TTS Audio Synthesis
      setPipelineStage(4);
      await new Promise((r) => setTimeout(r, 350));

      // 5. Dispatch Alert
      setPipelineStage(5);
      await api.dispatchAlert({
        advisory_id: advRes.advisory_id,
        channels: ['SMS', 'IVR']
      });

      // Refresh Logs
      const [updatedLogs, updatedStats] = await Promise.all([
        api.getLiveDispatches(20),
        api.getStats()
      ]);
      setDispatches(updatedLogs);
      setStats(updatedStats);

    } catch (err) {
      console.error('Advisory pipeline error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct Alert Dispatch
  const handleDispatchAlert = async (advisoryId: number, channels: string[]) => {
    setIsDispatching(true);
    try {
      await api.dispatchAlert({
        advisory_id: advisoryId,
        channels: channels
      });
      const [updatedLogs, updatedStats] = await Promise.all([
        api.getLiveDispatches(20),
        api.getStats()
      ]);
      setDispatches(updatedLogs);
      setStats(updatedStats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDispatching(false);
    }
  };

  // Simulate IVR DTMF Keypress
  const handleSimulateKeyPress = async (dispatchId: number, digit: string) => {
    try {
      await api.simulateIVRPress(dispatchId, digit);
      const updatedLogs = await api.getLiveDispatches(20);
      setDispatches(updatedLogs);
      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans text-slate-100">
      {/* Navbar */}
      <Navbar
        onOpenFarmers={() => setIsFarmersModalOpen(true)}
        onOpenIVRSimulator={() => setIsIVRModalOpen(true)}
        mockMode={health?.mock_telephony ?? true}
        totalFarmers={farmers.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <StatsCards
          stats={stats}
          activeSimulation={activeSimulation}
        />

        {/* Hazard Controller */}
        <DisasterControlBar
          districts={districts}
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}
          windSpeed={windSpeed}
          onWindSpeedChange={setWindSpeed}
          rainfall={rainfall}
          onRainfallChange={setRainfall}
          eventType={eventType}
          onEventTypeChange={setEventType}
          onTriggerEmergency={handleTriggerEmergency}
          isProcessing={isProcessing}
          onApplyPreset={handleApplyPreset}
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Map & Audio */}
          <div className="lg:col-span-7 space-y-6">
            <AgriRiskMap
              districts={districts}
              farmers={farmers}
              activeSimulation={activeSimulation}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
              onQuickSimulateFarmer={(f) => {
                setSelectedFarmer(f);
                setSelectedDistrict(f.district);
              }}
            />

            <AudioBroadcastPlayer
              advisory={activeAdvisory}
            />
          </div>

          {/* Right Column: AI Advisory Card & Live Telephony Feed */}
          <div className="lg:col-span-5 space-y-6">
            <AdvisoryBreakdownCard
              advisory={activeAdvisory}
              farmer={selectedFarmer}
              onDispatchAlert={handleDispatchAlert}
              isDispatching={isDispatching}
            />

            <LiveDispatchTracker
              logs={dispatches}
              onSimulateKeyPress={handleSimulateKeyPress}
              onRefresh={() => api.getLiveDispatches(20).then(setDispatches)}
              activeStage={pipelineStage}
            />
          </div>
        </div>
      </main>

      {/* Phone Handset Simulator Modal */}
      <InteractiveIVRModal
        isOpen={isIVRModalOpen}
        onClose={() => setIsIVRModalOpen(false)}
        advisory={activeAdvisory}
        onReportDamage={() => {
          api.getStats().then(setStats);
          api.getLiveDispatches(20).then(setDispatches);
        }}
      />

      {/* Farmer Registry Modal */}
      <FarmerDirectoryModal
        isOpen={isFarmersModalOpen}
        onClose={() => setIsFarmersModalOpen(false)}
        farmers={farmers}
        onRefresh={loadInitialData}
        onSelectFarmerForAdvisory={(f) => {
          setSelectedFarmer(f);
          setSelectedDistrict(f.district);
          handleTriggerEmergency();
        }}
      />

      {/* Clean Minimalist Footer */}
      <footer className="w-full border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AgriShield AI • Climate-Resilient Agricultural Disaster Mitigation Platform</span>
          <span>FastAPI • Next.js • Open-Meteo • Gemini AI • Twilio IVR</span>
        </div>
      </footer>
    </div>
  );
}
