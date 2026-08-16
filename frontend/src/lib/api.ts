import { 
  Farmer, 
  DistrictHazard, 
  LiveWeather, 
  SimulationResult, 
  GeneratedAdvisory, 
  DispatchLogItem, 
  DashboardStats 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`API error ${res.status}: ${errBody}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`Fetch failed for ${url}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => fetchJSON<{ status: string; mock_telephony: boolean; gemini_active: boolean; twilio_active: boolean }>('/health'),

  // Farmers
  getFarmers: (district?: string) => 
    fetchJSON<Farmer[]>(`/farmers${district ? `?district=${encodeURIComponent(district)}` : ''}`),
  
  createFarmer: (farmer: Partial<Farmer>) =>
    fetchJSON<Farmer>('/farmers', {
      method: 'POST',
      body: JSON.stringify(farmer),
    }),

  updateFarmer: (id: number, data: Partial<Farmer>) =>
    fetchJSON<Farmer>(`/farmers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteFarmer: (id: number) =>
    fetchJSON<{ message: string }>(`/farmers/${id}`, {
      method: 'DELETE',
    }),

  resetSeedFarmers: () =>
    fetchJSON<{ message: string; total_farmers: number }>('/farmers/reset-seeds', {
      method: 'POST',
    }),

  // Weather & Disaster Simulation
  getDistricts: () => fetchJSON<DistrictHazard[]>('/weather/districts'),

  getLiveWeather: (district: string) =>
    fetchJSON<LiveWeather>(`/weather/current/${encodeURIComponent(district)}`),

  simulateDisaster: (data: { district: string; wind_speed_kmh: number; rainfall_mm: number; event_type: string }) =>
    fetchJSON<{ simulation: SimulationResult; affected_farmers_count: number; affected_farmers: Farmer[] }>('/weather/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI Agronomist Advisory
  generateAdvisory: (payload: {
    farmer_id?: number;
    farmer_name?: string;
    district: string;
    crop_type: string;
    crop_stage: string;
    soil_type: string;
    language: string;
    event_type: string;
    wind_speed_kmh: number;
    rainfall_mm: number;
  }) =>
    fetchJSON<GeneratedAdvisory>('/advisory/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdvisory: (id: number) => fetchJSON<GeneratedAdvisory>(`/advisory/${id}`),

  // Telephony & Alerts
  dispatchAlert: (payload: { advisory_id: number; override_phone?: string; channels: string[] }) =>
    fetchJSON<{
      advisory_id: number;
      farmer_name: string;
      target_phone: string;
      district: string;
      dispatches: Array<{ dispatch_id: number; channel: string; status: string; to: string; sid?: string; simulated: boolean }>;
    }>('/alerts/dispatch', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getLiveDispatches: (limit: number = 30) =>
    fetchJSON<DispatchLogItem[]>(`/alerts/live?limit=${limit}`),

  simulateIVRPress: (dispatch_id: number, digit_pressed: string) =>
    fetchJSON<{ dispatch_id: number; new_status: string; ivr_response: string }>('/alerts/simulate-ivr-press', {
      method: 'POST',
      body: JSON.stringify({ dispatch_id, digit_pressed }),
    }),

  // Analytics Stats
  getStats: () => fetchJSON<DashboardStats>('/stats'),

  // Full Audio URL Helper
  getAudioStreamUrl: (filenameOrPath: string) => {
    if (!filenameOrPath) return '';
    if (filenameOrPath.startsWith('http')) return filenameOrPath;
    if (filenameOrPath.startsWith('/api')) return `http://127.0.0.1:8000${filenameOrPath}`;
    return `http://127.0.0.1:8000/api/audio/stream/${filenameOrPath}`;
  }
};
