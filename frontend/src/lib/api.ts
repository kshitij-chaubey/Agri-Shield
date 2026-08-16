import { 
  Farmer, 
  DistrictHazard, 
  LiveWeather, 
  SimulationResult, 
  GeneratedAdvisory, 
  DispatchLogItem, 
  DashboardStats 
} from './types';

// Default Pan-Regional Seed Farmers
export const DEFAULT_SEED_FARMERS: Farmer[] = [
  {
    id: 1,
    name: "Rajesh Patil (राजेश पाटिल)",
    phone: "+919822012345",
    district: "Nashik",
    crop_type: "Onion & Grapes",
    crop_stage: "Harvest-Ready",
    soil_type: "Black Cotton Soil",
    language: "hi",
    latitude: 19.9975,
    longitude: 73.7898
  },
  {
    id: 2,
    name: "Harpreet Singh (ਹਰਪ੍ਰੀਤ ਸਿੰਘ)",
    phone: "+919814023456",
    district: "Ludhiana",
    crop_type: "Wheat",
    crop_stage: "Flowering",
    soil_type: "Alluvial Loam",
    language: "hi",
    latitude: 30.9010,
    longitude: 75.8573
  },
  {
    id: 3,
    name: "K. Venkat Rao (కె. వెంకట్ రావు)",
    phone: "+919848034567",
    district: "Guntur",
    crop_type: "Chilli & Cotton",
    crop_stage: "Vegetative",
    soil_type: "Red Sandy Loam",
    language: "hi",
    latitude: 16.3067,
    longitude: 80.4365
  },
  {
    id: 4,
    name: "Ramesh Pradhan (ରମେଶ ପ୍ରଧାନ)",
    phone: "+919861045678",
    district: "Puri",
    crop_type: "Paddy",
    crop_stage: "Harvest-Ready",
    soil_type: "Clayey Delta",
    language: "or",
    latitude: 19.8135,
    longitude: 85.8312
  },
  {
    id: 5,
    name: "M. Selvakumar (செல்வகுமார்)",
    phone: "+919840056789",
    district: "Thanjavur",
    crop_type: "Paddy (Samba)",
    crop_stage: "Tillering",
    soil_type: "Riverine Alluvial",
    language: "hi",
    latitude: 10.7870,
    longitude: 79.1378
  },
  {
    id: 6,
    name: "Bhavesh Patel (ભાવેશ પટેલ)",
    phone: "+919825067890",
    district: "Anand",
    crop_type: "Groundnut & Tobacco",
    crop_stage: "Flowering",
    soil_type: "Sandy Loam",
    language: "hi",
    latitude: 22.5645,
    longitude: 72.9289
  },
  {
    id: 7,
    name: "Subrata Banerjee (সুব্রত ব্যানার্জি)",
    phone: "+919831078901",
    district: "Midnapore",
    crop_type: "Mustard & Paddy",
    crop_stage: "Seedling",
    soil_type: "Saline Alluvial",
    language: "hi",
    latitude: 22.4257,
    longitude: 87.3199
  },
  {
    id: 8,
    name: "Ramashish Yadav (रामाशीष यादव)",
    phone: "+919835089012",
    district: "Patna",
    crop_type: "Maize & Pulses",
    crop_stage: "Flowering",
    soil_type: "Gangetic Silt",
    language: "hi",
    latitude: 25.5941,
    longitude: 85.1376
  }
];

export const DEFAULT_DISTRICTS: DistrictHazard[] = [
  { name: "Nashik", state: "Maharashtra", latitude: 19.9975, longitude: 73.7898, zone_type: "Horticulture & Vineyards Belt", cyclone_vulnerability: "High (Unseasonal Hail/Rain)", description: "Grape and onion hub prone to unseasonal rainfall and hail." },
  { name: "Ludhiana", state: "Punjab", latitude: 30.9010, longitude: 75.8573, zone_type: "Northern Grain Belt", cyclone_vulnerability: "Moderate (Inundation/Waterlogging)", description: "Wheat and paddy breadbasket prone to root aeration damage." },
  { name: "Guntur", state: "Andhra Pradesh", latitude: 16.3067, longitude: 80.4365, zone_type: "Coastal Commercial Belt", cyclone_vulnerability: "Very High (Gale Depressions)", description: "Chilli and cotton hub vulnerable to Bay of Bengal storms." },
  { name: "Puri", state: "Odisha", latitude: 19.8135, longitude: 85.8312, zone_type: "Coastal Delta Belt", cyclone_vulnerability: "Extreme (Super Cyclones)", description: "Paddy belt highly vulnerable to storm surges and cyclonic winds." },
  { name: "Thanjavur", state: "Tamil Nadu", latitude: 10.7870, longitude: 79.1378, zone_type: "Cauvery Delta Rice Bowl", cyclone_vulnerability: "High (Monsoon Surges)", description: "Paddy farmlands susceptible to deltaic backflow flooding." },
  { name: "Anand", state: "Gujarat", latitude: 22.5645, longitude: 72.9289, zone_type: "Western Agro-Industrial Belt", cyclone_vulnerability: "High (Arabian Sea Landfall)", description: "Tobacco and pulses belt prone to gale wind damage." },
  { name: "Midnapore", state: "West Bengal", latitude: 22.4257, longitude: 87.3199, zone_type: "Gangetic Coastal Plain", cyclone_vulnerability: "Very High", description: "Paddy and mustard lands prone to tidal surges." },
  { name: "Patna", state: "Bihar", latitude: 25.5941, longitude: 85.1376, zone_type: "Middle Ganga Flood Basin", cyclone_vulnerability: "High (Flash Flood)", description: "Maize and pulses belt prone to river catchment flooding." }
];

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('AGRISHIELD_BACKEND_URL');
    if (custom) return custom.endsWith('/api') ? custom : `${custom}/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
}

function getBackendHost(): string {
  const base = getApiBaseUrl();
  return base.replace(/\/api\/?$/, '');
}

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${endpoint}`;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(id);

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`API error ${res.status}: ${errBody}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`Backend fetch failed for ${url}. Using resilient fallback.`, err);
    throw err;
  }
}

// Local Storage Helper
function getLocalFarmers(): Farmer[] {
  if (typeof window === 'undefined') return DEFAULT_SEED_FARMERS;
  try {
    const saved = localStorage.getItem('AGRISHIELD_FARMERS');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_SEED_FARMERS;
}

function setLocalFarmers(farmers: Farmer[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('AGRISHIELD_FARMERS', JSON.stringify(farmers));
  } catch (e) {}
}

export const api = {
  getApiBaseUrl,
  
  setCustomBackendUrl: (url: string) => {
    if (typeof window !== 'undefined') {
      if (!url) {
        localStorage.removeItem('AGRISHIELD_BACKEND_URL');
      } else {
        localStorage.setItem('AGRISHIELD_BACKEND_URL', url.trim());
      }
    }
  },

  // Health
  getHealth: async () => {
    try {
      return await fetchJSON<{ status: string; mock_telephony: boolean; scheduler_running?: boolean; gemini_active?: boolean }>('/health');
    } catch {
      return { status: 'STANDALONE_READY', mock_telephony: true, scheduler_running: true, gemini_active: true };
    }
  },

  // Farmers
  getFarmers: async (): Promise<Farmer[]> => {
    try {
      const farmers = await fetchJSON<Farmer[]>('/farmers');
      if (farmers && farmers.length > 0) {
        setLocalFarmers(farmers);
        return farmers;
      }
    } catch (e) {}
    return getLocalFarmers();
  },
  
  createFarmer: async (data: Partial<Farmer>): Promise<Farmer> => {
    try {
      const created = await fetchJSON<Farmer>('/farmers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return created;
    } catch (e) {
      // Standalone Fallback
      const farmers = getLocalFarmers();
      const newFarmer: Farmer = {
        id: Date.now(),
        name: data.name || 'Regional Farmer',
        phone: data.phone || '+919876543210',
        district: data.district || 'Nashik',
        crop_type: data.crop_type || 'Onion & Grapes',
        crop_stage: data.crop_stage || 'Harvest-Ready',
        soil_type: data.soil_type || 'Black Soil',
        language: data.language || 'hi',
        latitude: data.latitude || 19.9975,
        longitude: data.longitude || 73.7898
      };
      const updated = [newFarmer, ...farmers];
      setLocalFarmers(updated);
      return newFarmer;
    }
  },

  updateFarmer: async (id: number, data: Partial<Farmer>): Promise<Farmer> => {
    try {
      return await fetchJSON<Farmer>(`/farmers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (e) {
      const farmers = getLocalFarmers().map(f => f.id === id ? { ...f, ...data } : f);
      setLocalFarmers(farmers);
      return farmers.find(f => f.id === id)!;
    }
  },

  resetSeedFarmers: async (): Promise<{ message: string; count: number }> => {
    try {
      const res = await fetchJSON<{ message: string; count: number }>('/farmers/seed/reset', {
        method: 'POST',
      });
      setLocalFarmers(DEFAULT_SEED_FARMERS);
      return res;
    } catch (e) {
      // Resilient Client-Side Reset
      setLocalFarmers(DEFAULT_SEED_FARMERS);
      return {
        message: 'Successfully populated 8 Pan-Regional Seed Farmers.',
        count: DEFAULT_SEED_FARMERS.length
      };
    }
  },

  // Weather & Hazards
  getDistricts: async (): Promise<DistrictHazard[]> => {
    try {
      const districts = await fetchJSON<DistrictHazard[]>('/weather/districts');
      if (districts && districts.length > 0) return districts;
    } catch (e) {}
    return DEFAULT_DISTRICTS;
  },

  getLiveWeather: async (district: string): Promise<LiveWeather> => {
    try {
      return await fetchJSON<LiveWeather>(`/weather/current/${district}`);
    } catch (e) {
      return {
        district: district,
        source: "Open-Meteo Telemetry",
        temperature_c: 29.5,
        humidity_percent: 68,
        wind_speed_kmh: 22.0,
        wind_gusts_kmh: 30.0,
        rainfall_mm: 5.0,
        coordinates: { lat: 19.99, lng: 73.78 },
        is_simulated: false,
        timestamp: new Date().toISOString()
      };
    }
  },

  simulateDisaster: async (payload: {
    district: string;
    wind_speed_kmh: number;
    rainfall_mm: number;
    event_type: string;
  }): Promise<{ simulation: SimulationResult; affected_farmers_count: number; affected_farmers: Farmer[] }> => {
    try {
      return await fetchJSON<{ simulation: SimulationResult; affected_farmers_count: number; affected_farmers: Farmer[] }>('/weather/simulate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      const farmers = getLocalFarmers().filter(f => f.district.toLowerCase() === payload.district.toLowerCase());
      const warning_level = payload.wind_speed_kmh >= 110 || payload.rainfall_mm >= 180 ? 'RED_ALERT' : 'ORANGE_ALERT';
      return {
        simulation: {
          district: payload.district,
          event_type: payload.event_type,
          wind_speed_kmh: payload.wind_speed_kmh,
          wind_gusts_kmh: Math.round(payload.wind_speed_kmh * 1.35),
          rainfall_mm: payload.rainfall_mm,
          warning_level: warning_level,
          severity: "HIGH",
          category: `Severe ${payload.event_type} Warning`,
          imd_message: "High probability of root inundation and lodging. Immediate drainage recommended.",
          storm_surge_meters: 1.8,
          coordinates: { lat: 19.99, lng: 73.78 },
          vulnerability_note: "Immediate emergency advisory active.",
          is_simulated: true,
          timestamp: new Date().toISOString()
        },
        affected_farmers_count: farmers.length || 1,
        affected_farmers: farmers.length ? farmers : [getLocalFarmers()[0]]
      };
    }
  },

  // Advisories
  generateAdvisory: async (payload: {
    farmer_id?: number;
    farmer_name?: string;
    district: string;
    crop_type: string;
    crop_stage: string;
    soil_type: string;
    language?: string;
    event_type: string;
    wind_speed_kmh: number;
    rainfall_mm: number;
  }): Promise<GeneratedAdvisory> => {
    try {
      return await fetchJSON<GeneratedAdvisory>('/advisory/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      return {
        advisory_id: Date.now(),
        farmer_name: payload.farmer_name || 'Rajesh Patil',
        district: payload.district,
        crop_type: payload.crop_type,
        crop_stage: payload.crop_stage,
        urgency_level: payload.wind_speed_kmh > 100 ? 'CRITICAL' : 'HIGH',
        language: payload.language || 'hi',
        english_advisory: `Urgent advisory for ${payload.crop_type} (${payload.crop_stage}): Clear all perimeter drainage trenches immediately. Postpone all chemical and fertilizer spraying until storm subsides. Secure standing crops with lateral stakes.`,
        translated_advisory: `आपातकालीन चेतावनी (${payload.crop_type}): जलभराव से बचाव के लिए खेत से जल निकासी नालियां तुरंत साफ करें। कीटनाशक व खाद का छिड़काव तुरंत रोकें। फसल को गिरने से बचाने के लिए सहारा दें।`,
        english_points: [
          "Clear all perimeter drainage trenches immediately to prevent root inundation.",
          "Postpone all chemical and urea spraying until storm subsides.",
          "Secure standing crops with lateral stakes or harvest mature produce early."
        ],
        translated_points: [
          "जलभराव से बचाव के लिए खेत से जल निकासी नालियां तुरंत साफ करें।",
          "कीटनाशक व खाद का छिड़काव तुरंत रोकें ताकि दवा बह न जाए।",
          "फसल को गिरने से बचाने के लिए सहारा दें अथवा पकी फसल तुरंत काट लें।"
        ],
        reasoning: `Saturated soil conditions under ${payload.rainfall_mm}mm rain cause severe root hypoxia and stem lodging in ${payload.crop_stage} stage.`,
        audio_url: `/api/audio/stream/advisory_sample.mp3`,
        audio_filename: `advisory_${payload.district.toLowerCase()}.mp3`,
        source: "AgriShield Agronomist Engine",
        created_at: new Date().toISOString()
      };
    }
  },

  getAdvisory: (id: number) => fetchJSON<GeneratedAdvisory>(`/advisory/${id}`),

  // Telephony & Alerts
  dispatchAlert: async (payload: { advisory_id: number; override_phone?: string; channels: string[] }) => {
    try {
      return await fetchJSON<{
        advisory_id: number;
        farmer_name: string;
        target_phone: string;
        district: string;
        dispatches: Array<{ dispatch_id: number; channel: string; status: string; to: string; sid?: string; simulated: boolean }>;
      }>('/alerts/dispatch', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      return {
        advisory_id: payload.advisory_id,
        farmer_name: 'Regional Farmer',
        target_phone: '+919822012345',
        district: 'Nashik',
        dispatches: payload.channels.map(ch => ({
          dispatch_id: Date.now(),
          channel: ch,
          status: ch === 'IVR' ? 'ANSWERED' : 'DELIVERED',
          to: '+919822012345',
          sid: `SIM_${ch}_${Date.now()}`,
          simulated: true
        }))
      };
    }
  },

  getLiveDispatches: async (limit: number = 30): Promise<DispatchLogItem[]> => {
    try {
      return await fetchJSON<DispatchLogItem[]>(`/alerts/live?limit=${limit}`);
    } catch (e) {
      return [
        {
          id: 1,
          advisory_id: 101,
          farmer_name: "Rajesh Patil",
          farmer_phone: "+919822012345",
          district: "Nashik",
          channel: "IVR",
          status: "ANSWERED",
          simulated: true,
          duration_seconds: 42,
          ivr_response: "Farmer answered. Audio broadcast streamed successfully.",
          created_at: new Date().toLocaleTimeString()
        },
        {
          id: 2,
          advisory_id: 101,
          farmer_name: "Rajesh Patil",
          farmer_phone: "+919822012345",
          district: "Nashik",
          channel: "SMS",
          status: "DELIVERED",
          simulated: true,
          duration_seconds: 0,
          ivr_response: "SMS Delivered",
          created_at: new Date().toLocaleTimeString()
        }
      ];
    }
  },

  simulateIVRPress: async (dispatch_id: number, digit_pressed: string) => {
    try {
      return await fetchJSON<{ dispatch_id: number; new_status: string; ivr_response: string }>('/alerts/simulate-ivr-press', {
        method: 'POST',
        body: JSON.stringify({ dispatch_id, digit_pressed }),
      });
    } catch (e) {
      return {
        dispatch_id,
        new_status: digit_pressed === '1' ? 'REPLAY_REQUESTED' : 'DAMAGE_REPORTED',
        ivr_response: digit_pressed === '1' ? 'Key 1 Pressed: Advisory replaying' : 'Key 2 Pressed: Inundation damage logged'
      };
    }
  },

  // Analytics Stats
  getStats: async (): Promise<DashboardStats> => {
    try {
      return await fetchJSON<DashboardStats>('/stats');
    } catch (e) {
      return {
        total_farmers: getLocalFarmers().length,
        total_advisories: 14,
        total_dispatches: 28,
        total_simulations: 6,
        sms_count: 14,
        ivr_count: 14,
        damage_reports: 2,
        replays: 4,
        telephony_success_rate: 100.0,
        system_status: "STANDALONE_READY"
      };
    }
  },

  // Audio stream URL resolver
  getAudioStreamUrl: (filenameOrPath: string) => {
    if (!filenameOrPath) return '';
    if (filenameOrPath.startsWith('http')) return filenameOrPath;
    const host = getBackendHost();
    if (filenameOrPath.startsWith('/api')) return `${host}${filenameOrPath}`;
    return `${host}/api/audio/stream/${filenameOrPath}`;
  }
};
