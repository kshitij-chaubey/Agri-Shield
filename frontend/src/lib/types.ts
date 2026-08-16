export interface Farmer {
  id: number;
  name: string;
  phone: string;
  district: string;
  crop_type: string;
  crop_stage: string;
  soil_type: string;
  language: string; // 'hi' | 'en' | 'or'
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface DistrictHazard {
  name: string;
  state?: string;
  latitude: number;
  longitude: number;
  zone_type: string;
  cyclone_vulnerability: string;
  description: string;
}

export interface LiveWeather {
  district: string;
  state?: string;
  source: string;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  wind_gusts_kmh: number;
  rainfall_mm: number;
  surface_pressure_hpa?: number;
  coordinates: { lat: number; lng: number };
  is_simulated: boolean;
  timestamp: string;
}

export interface SimulationResult {
  district: string;
  state?: string;
  event_type: string;
  wind_speed_kmh: number;
  wind_gusts_kmh: number;
  rainfall_mm: number;
  warning_level: string; // 'RED_ALERT' | 'ORANGE_ALERT' | 'YELLOW_ALERT' | 'GREEN_NORMAL'
  severity: string;
  category: string;
  imd_message: string;
  storm_surge_meters: number;
  coordinates: { lat: number; lng: number };
  zone_type?: string;
  vulnerability_note: string;
  is_simulated: boolean;
  timestamp: string;
}

export interface GeneratedAdvisory {
  advisory_id: number;
  farmer_id?: number;
  farmer_name: string;
  district: string;
  crop_type: string;
  crop_stage: string;
  urgency_level: string;
  language: string;
  english_advisory: string;
  translated_advisory: string;
  english_points: string[];
  translated_points: string[];
  reasoning: string;
  audio_url: string;
  audio_filename: string;
  source: string;
  created_at: string;
}

export interface DispatchLogItem {
  id: number;
  advisory_id: number;
  farmer_name: string;
  farmer_phone: string;
  district: string;
  channel: 'SMS' | 'IVR';
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'ANSWERED' | 'FAILED' | 'REPLAY_REQUESTED' | 'DAMAGE_REPORTED';
  twilio_sid?: string;
  simulated: boolean;
  ivr_response?: string;
  duration_seconds: number;
  created_at: string;
}

export interface DashboardStats {
  total_farmers: number;
  total_advisories: number;
  total_dispatches: number;
  total_simulations: number;
  sms_count: number;
  ivr_count: number;
  damage_reports: number;
  replays: number;
  telephony_success_rate: number;
  system_status: string;
}
