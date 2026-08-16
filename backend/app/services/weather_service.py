import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime

# Pan-Regional Agricultural Zones & Geospatial Coordinates
AGRICULTURAL_REGIONS: Dict[str, Dict[str, Any]] = {
    "Nashik": {
        "state": "Maharashtra",
        "lat": 19.9975,
        "lng": 73.7898,
        "zone_type": "Horticulture & Vineyards Belt",
        "cyclone_vulnerability": "Moderate (Heavy Unseasonal Rains)",
        "description": "Major onion, grape, and vegetable belt vulnerable to sudden unseasonal downpours and hail."
    },
    "Ludhiana": {
        "state": "Punjab",
        "lat": 30.9010,
        "lng": 75.8573,
        "zone_type": "Northern Grain Belt",
        "cyclone_vulnerability": "Flash Flood / Inundation",
        "description": "Intensive wheat & paddy cultivation prone to drainage overflow and seasonal waterlogging."
    },
    "Guntur": {
        "state": "Andhra Pradesh",
        "lat": 16.3067,
        "lng": 80.4365,
        "zone_type": "Coastal Commercial Belt",
        "cyclone_vulnerability": "Very High (Bay of Bengal Storms)",
        "description": "Chilli, cotton, and tobacco hub susceptible to coastal depressions and gale winds."
    },
    "Puri": {
        "state": "Odisha",
        "lat": 19.8135,
        "lng": 85.8312,
        "zone_type": "Coastal Delta Belt",
        "cyclone_vulnerability": "Extreme (Direct Cyclone Landfall)",
        "description": "Paddy and betel vine zone highly exposed to direct coastal storm surges."
    },
    "Thanjavur": {
        "state": "Tamil Nadu",
        "lat": 10.7870,
        "lng": 79.1378,
        "zone_type": "Cauvery Delta Rice Bowl",
        "cyclone_vulnerability": "High (Northeast Monsoon Surge)",
        "description": "Paddy delta vulnerable to unseasonal flood inundation during cyclone season."
    },
    "Anand": {
        "state": "Gujarat",
        "lat": 22.5645,
        "lng": 72.9289,
        "zone_type": "Western Agro-Industrial Belt",
        "cyclone_vulnerability": "High (Arabian Sea Landfall)",
        "description": "Tobacco, banana, and pulses belt prone to Arabian Sea cyclonic gale winds."
    },
    "Midnapore": {
        "state": "West Bengal",
        "lat": 22.4257,
        "lng": 87.3199,
        "zone_type": "Gangetic Coastal Plain",
        "cyclone_vulnerability": "Very High",
        "description": "Paddy and mustard farmlands prone to tidal surges and severe waterlogging."
    },
    "Patna": {
        "state": "Bihar",
        "lat": 25.5941,
        "lng": 85.1376,
        "zone_type": "Middle Ganga Flood Basin",
        "cyclone_vulnerability": "High (Flash Flood / Inundation)",
        "description": "Maize, pulses, and paddy belt highly prone to river catchment flooding."
    }
}

class WeatherService:
    @staticmethod
    async def get_live_weather(region_name: str) -> Dict[str, Any]:
        """Fetch real-time weather from Open-Meteo API for given agricultural region"""
        region = AGRICULTURAL_REGIONS.get(region_name)
        if not region:
            # Fallback to closest match
            match_key = next((k for k in AGRICULTURAL_REGIONS.keys() if k.lower() == region_name.lower()), "Nashik")
            region = AGRICULTURAL_REGIONS[match_key]
            region_name = match_key
            
        lat = region["lat"]
        lng = region["lng"]
        
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lng}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m,surface_pressure"
            f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max"
            f"&timezone=Asia%2FKolkata"
        )
        
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    curr = data.get("current", {})
                    wind_kmh = curr.get("wind_speed_10m", 16.0)
                    rain_mm = curr.get("precipitation", 0.0)
                    temp_c = curr.get("temperature_2m", 28.5)
                    humidity = curr.get("relative_humidity_2m", 65)
                    gusts_kmh = curr.get("wind_gusts_10m", wind_kmh * 1.3)
                    
                    return {
                        "district": region_name,
                        "state": region.get("state", ""),
                        "source": "Open-Meteo Live API",
                        "temperature_c": temp_c,
                        "humidity_percent": humidity,
                        "wind_speed_kmh": round(wind_kmh, 1),
                        "wind_gusts_kmh": round(gusts_kmh, 1),
                        "rainfall_mm": round(rain_mm, 1),
                        "surface_pressure_hpa": curr.get("surface_pressure", 1010.0),
                        "coordinates": {"lat": lat, "lng": lng},
                        "is_simulated": False,
                        "timestamp": datetime.utcnow().isoformat()
                    }
        except Exception as e:
            print(f"Error fetching live Open-Meteo weather: {e}")
            
        # Fallback baseline
        return {
            "district": region_name,
            "state": region.get("state", ""),
            "source": "Open-Meteo Baseline Feed",
            "temperature_c": 29.0,
            "humidity_percent": 70,
            "wind_speed_kmh": 18.0,
            "wind_gusts_kmh": 25.0,
            "rainfall_mm": 2.0,
            "surface_pressure_hpa": 1008.0,
            "coordinates": {"lat": lat, "lng": lng},
            "is_simulated": False,
            "timestamp": datetime.utcnow().isoformat()
        }

    @staticmethod
    def simulate_weather_event(
        district: str,
        wind_speed_kmh: float,
        rainfall_mm: float,
        event_type: str = "Cyclone"
    ) -> Dict[str, Any]:
        """Simulate an Extreme Meteorological Warning (Cyclone, Flash Flood, Heavy Rain, Hailstorm)"""
        region = AGRICULTURAL_REGIONS.get(district, AGRICULTURAL_REGIONS["Nashik"])
        
        # Calculate Warning Alert Level
        if wind_speed_kmh >= 110 or rainfall_mm >= 180:
            warning_level = "RED_ALERT"
            severity = "EXTREME_SEVERITY"
            category = f"Severe {event_type} Warning / Critical Risk"
            alert_message = "Severe damage risk to standing crops. Urgent field interventions required."
        elif wind_speed_kmh >= 75 or rainfall_mm >= 100:
            warning_level = "ORANGE_ALERT"
            severity = "HIGH"
            category = f"Elevated {event_type} Warning"
            alert_message = "High probability of root inundation, crop lodging, and post-harvest moisture rot."
        elif wind_speed_kmh >= 45 or rainfall_mm >= 40:
            warning_level = "YELLOW_ALERT"
            severity = "MODERATE"
            category = f"Moderate {event_type} Advisory"
            alert_message = "Advisory for preventive trenching, drainage clearing, and postponement of sprays."
        else:
            warning_level = "GREEN_NORMAL"
            severity = "NORMAL"
            category = "Standard Agro-Meteorological Conditions"
            alert_message = "Normal field operations can proceed with regular monitoring."

        storm_surge_meters = round(min(5.0, max(0.0, (wind_speed_kmh / 28.0) - 1.0)), 1) if event_type in ["Cyclone", "Severe Storm"] else 0.0

        return {
            "district": district,
            "state": region.get("state", ""),
            "event_type": event_type,
            "wind_speed_kmh": wind_speed_kmh,
            "wind_gusts_kmh": round(wind_speed_kmh * 1.35, 1),
            "rainfall_mm": rainfall_mm,
            "warning_level": warning_level,
            "severity": severity,
            "category": category,
            "imd_message": alert_message,
            "storm_surge_meters": storm_surge_meters,
            "coordinates": {"lat": region["lat"], "lng": region["lng"]},
            "zone_type": region.get("zone_type", "Agricultural Farmland"),
            "vulnerability_note": region.get("description", ""),
            "is_simulated": True,
            "timestamp": datetime.utcnow().isoformat()
        }

weather_service = WeatherService()
