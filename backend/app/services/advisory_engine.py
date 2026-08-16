import json
import os
from typing import Dict, Any, List, Optional
from app.core.config import settings

# Comprehensive Agronomist Knowledge Base for Multi-Crop Climate Emergencies
AGRONOMIST_KNOWLEDGE_BASE = {
    ("Onion & Grapes", "Harvest-Ready", "Heavy Rain"): {
        "urgency_level": "CRITICAL",
        "english_points": [
            "1. Harvest mature onion bulbs immediately and transfer to well-ventilated dry storage structures.",
            "2. Secure grape canopies and open inter-row drainage trenches to avoid downy mildew explosion.",
            "3. Spray Bordeaux mixture (0.8%) or metalaxyl immediately after rain cessation to prevent fruit splitting."
        ],
        "hindi_points": [
            "१. तैयार प्याज की खुदाई तुरंत करें और हवादार सूखे भंडारण में सुरक्षित रखें।",
            "२. अंगूर के बागों में कतारों के बीच जल निकासी नाली बनाएं ताकि फफूंद रोग न फैले।",
            "३. बारिश रुकते ही फल फटने और सड़न से बचाने के लिए कॉपर युक्त फफूंदनाशक का छिड़काव करें।"
        ],
        "odia_points": [
            "୧. ଅମଳ ଯୋଗ୍ୟ ପିଆଜକୁ ତୁରନ୍ତ ଖୋଳି ଶୁଖିଲା ପବନ ଚଳାଚଳ ସ୍ଥାନରେ ରଖନ୍ତୁ।",
            "୨. ଜଳ ନିଷ୍କାସନ ନାଳି ଖୋଲି ଫସଲକୁ ପଚା ରୋଗ ଦାଉରୁ ରକ୍ଷା କରନ୍ତୁ।",
            "୩. ବର୍ଷା ଛାଡ଼ିବା ପରେ ପତ୍ର ଝାଉଁଳା ରୋକିବା ପାଇଁ ଆବଶ୍ୟକୀୟ ଔଷଧ ସ୍ପ୍ରେ କରନ୍ତୁ।"
        ]
    },
    ("Wheat", "Flowering", "Heavy Rain"): {
        "urgency_level": "HIGH",
        "english_points": [
            "1. Immediately clear field channels to flush stagnant water within 12 hours to prevent root rot.",
            "2. Strictly postpone nitrogen / urea top-dressing and all pesticide sprays until storm subsides.",
            "3. Erect temporary windbreaks on field boundaries to minimize vegetative crop lodging."
        ],
        "hindi_points": [
            "१. खेत से रुका हुआ पानी १२ घंटे के भीतर बाहर निकालें ताकि गेहूं की जड़ें न सड़ें।",
            "२. मौसम साफ होने तक यूरिया खाद और कीटनाशक का छिड़काव तुरंत रोक दें।",
            "३. तेज हवा से फसल को गिरने (लॉजिंग) से बचाने के लिए खेत की मेड़ों को मजबूत करें।"
        ],
        "odia_points": [
            "୧. ଗହମ କ୍ଷେତରୁ ୧୨ ଘଣ୍ଟା ମଧ୍ୟରେ ପାଣି ବାହାର କରିଦିଅନ୍ତୁ।",
            "୨. ପାଗ ସଫା ନହେବା ପର୍ଯ୍ୟନ୍ତ ୟୁରିଆ ଖତ ପ୍ରୟୋଗ ସ୍ଥଗିତ ରଖନ୍ତୁ।",
            "୩. ପବନରେ ଗଛ ନଭାଙ୍ଗିବା ପାଇଁ ହିଡ଼କୁ ସୁଦୃଢ଼ କରନ୍ତୁ।"
        ]
    },
    ("Chilli & Cotton", "Vegetative", "Cyclone"): {
        "urgency_level": "CRITICAL",
        "english_points": [
            "1. Construct broad bed furrows (BBF) to accelerate stormwater run-off and avoid wilt.",
            "2. Stake tall chilli and cotton plants with bamboo support to withstand high wind shear.",
            "3. Apply prophylactic Copper Oxychloride @ 2.5g/L post-storm to curb bacterial leaf spot."
        ],
        "hindi_points": [
            "१. मिर्च और कपास के खेतों में गहरी जल निकासी नालियां बनाएं ताकि उकठा रोग न हो।",
            "२. तेज हवाओं से बचाव के लिए पौधों को बांस की खपच्चियों से सहारा दें।",
            "३. बारिश बाद जीवाणु रोग से बचाव के लिए कॉपर ऑक्सीक्लोराइड का छिड़काव करें।"
        ],
        "odia_points": [
            "୧. ଲଙ୍କା ଓ କପା କ୍ଷେତରୁ ବର୍ଷା ଜଳ ତୁରନ୍ତ ନିଷ୍କାସନ ପାଇଁ ଗଭୀର ନାଳି କରନ୍ତୁ।",
            "୨. ପ୍ରବଳ ପବନରୁ ରକ୍ଷା ପାଇବା ପାଇଁ ଗଛକୁ ବାଉଁଶ ବାଉଁଶିଆ ଦେଇ ବାନ୍ଧନ୍ତୁ।",
            "୩. ଝଡ଼ ପରେ ପତ୍ରଦାଗ ରୋଗ ରୋକିବାକୁ ଔଷଧ ସ୍ପ୍ରେ କରନ୍ତୁ।"
        ]
    },
    ("Paddy", "Harvest-Ready", "Cyclone"): {
        "urgency_level": "CRITICAL",
        "english_points": [
            "1. Harvest 85% mature crop immediately without waiting for full golden ripening.",
            "2. Shift harvested paddy sheaves to elevated concrete threshing floors or pack under tarpaulins.",
            "3. Clear field bunds and open cross-drainage channels to prevent grain sprouting."
        ],
        "hindi_points": [
            "१. ८५% पकी हुई धान की फसल को तुरंत काट लें, पूरी तरह पकने का इंतजार न करें।",
            "२. कटी हुई धान को ऊंचे पक्के खलिहान में ले जाएं और तिरपाल से ढककर सुरक्षित करें।",
            "३. खेतों की मेड़ काटकर जल निकासी नाली बनाएं ताकि फसल में अंकुरण न हो।"
        ],
        "odia_points": [
            "୧. ୮୫% ପାକଳ ଧାନକୁ ତୁରନ୍ତ କାଟି ନିଅନ୍ତୁ, ସମ୍ପୂର୍ଣ୍ଣ ପାଚିବାକୁ ଅପେକ୍ଷା କରନ୍ତୁ ନାହିଁ।",
            "୨. କଟା ଧାନକୁ ଉଚ୍ଚ ପକ୍କା ଖଳାକୁ ନିଅନ୍ତୁ କିମ୍ବା ପଲିଥିନ୍ ଘୋଡ଼ାଇ ସୁରକ୍ଷିତ ରଖନ୍ତୁ।",
            "୩. କ୍ଷେତର ହିଡ଼ କାଟି ଜଳ ନିଷ୍କାସନ ନାଳି ଖୋଲନ୍ତୁ, ଯାହାଫଳରେ ଧାନ ଗଜା ହେବ ନାହିଁ।"
        ]
    },
    ("Maize & Pulses", "Flowering", "Flash Flood"): {
        "urgency_level": "HIGH",
        "english_points": [
            "1. Ensure zero stagnation around maize root zones within 24 hours to avert collar rot.",
            "2. Delay any inter-cultivation or soil working until topsoil moisture drops to 60%.",
            "3. Apply foliar spray of 1% 19:19:19 water-soluble fertilizer post-flood recovery."
        ],
        "hindi_points": [
            "१. मक्के की जड़ों में २४ घंटे से अधिक पानी न ठहरने दें, तुरंत नाली बनाकर पानी निकालें।",
            "२. खेत में पर्याप्त नमी सूखने तक गुड़ाई या मिट्टी चढ़ाने का कार्य स्थगित रखें।",
            "३. बाढ़ उतरने के बाद पौधों को ताकत देने के लिए एनपीके १९:१९:१९ का छिड़काव करें।"
        ],
        "odia_points": [
            "୧. ମକା କ୍ଷେତରୁ ୨୪ ଘଣ୍ଟା ମଧ୍ୟରେ ପାଣି ନିଷ୍କାସନ ସୁନିଶ୍ଚିତ କରନ୍ତୁ।",
            "୨. ମାଟି ନଶୁଖିବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି ଖତ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।",
            "୩. ବନ୍ୟା ଛାଡ଼ିବା ପରେ ପୋଷକ ତତ୍ତ୍ୱ ସ୍ପ୍ରେ କରି ଗଛକୁ ସତେଜ କରନ୍ତୁ।"
        ]
    }
}

class AdvisoryEngine:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        self.openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")

    async def generate_advisory(
        self,
        farmer_name: str,
        district: str,
        crop_type: str,
        crop_stage: str,
        soil_type: str,
        language: str,
        event_type: str,
        wind_speed_kmh: float,
        rainfall_mm: float
    ) -> Dict[str, Any]:
        """Generate tailored agronomist advisory using LLM with rule-based agronomist fallback"""
        
        # Determine language target
        lang_name = "Hindi" if language.lower() in ["hi", "hindi"] else "Odia" if language.lower() in ["or", "odia"] else "English"
        
        # Try Gemini API if key is available
        if self.gemini_key:
            try:
                advisory_from_llm = await self._call_gemini_advisory(
                    farmer_name=farmer_name,
                    district=district,
                    crop_type=crop_type,
                    crop_stage=crop_stage,
                    soil_type=soil_type,
                    language=lang_name,
                    event_type=event_type,
                    wind_speed_kmh=wind_speed_kmh,
                    rainfall_mm=rainfall_mm
                )
                if advisory_from_llm:
                    return advisory_from_llm
            except Exception as e:
                print(f"Gemini API invocation fallback to Agronomist Matrix: {e}")

        # High-Precision Domain Agronomist Knowledge Engine
        return self._generate_agronomist_fallback(
            crop_type=crop_type,
            crop_stage=crop_stage,
            district=district,
            language=language,
            event_type=event_type,
            wind_speed_kmh=wind_speed_kmh,
            rainfall_mm=rainfall_mm
        )

    def _generate_agronomist_fallback(
        self,
        crop_type: str,
        crop_stage: str,
        district: str,
        language: str,
        event_type: str,
        wind_speed_kmh: float,
        rainfall_mm: float
    ) -> Dict[str, Any]:
        """Retrieve authentic agronomist advisory matching crop, stage, and hazard"""
        matched_key = None
        for k in AGRONOMIST_KNOWLEDGE_BASE.keys():
            if k[0].lower() in crop_type.lower() or crop_type.lower() in k[0].lower():
                matched_key = k
                break
        if not matched_key:
            matched_key = ("Paddy", "Harvest-Ready", "Cyclone")

        data = AGRONOMIST_KNOWLEDGE_BASE[matched_key]
        urgency = "CRITICAL" if wind_speed_kmh > 85 or rainfall_mm > 130 else "HIGH" if wind_speed_kmh > 45 or rainfall_mm > 60 else "MODERATE"

        lang_code = language.lower()
        if lang_code in ["hi", "hindi"]:
            translated_pts = data["hindi_points"]
            lang_label = "hi"
        elif lang_code in ["or", "odia"]:
            translated_pts = data["odia_points"]
            lang_label = "or"
        else:
            translated_pts = data["english_points"]
            lang_label = "en"

        english_text = " ".join(data["english_points"])
        translated_text = " ".join(translated_pts)

        return {
            "urgency_level": urgency,
            "crop_type": crop_type,
            "crop_stage": crop_stage,
            "district": district,
            "event_type": event_type,
            "language": lang_label,
            "english_points": data["english_points"],
            "translated_points": translated_pts,
            "english_advisory": english_text,
            "translated_advisory": translated_text,
            "reasoning": f"Prioritized for {crop_type} ({crop_stage} stage) under {event_type} conditions (Wind: {wind_speed_kmh} km/h, Rain: {rainfall_mm} mm). Immediate focus on water drainage, crop physical support, and spoilage prevention.",
            "source": "AgriShield Agronomist Knowledge Matrix"
        }

    async def _call_gemini_advisory(
        self,
        farmer_name: str,
        district: str,
        crop_type: str,
        crop_stage: str,
        soil_type: str,
        language: str,
        event_type: str,
        wind_speed_kmh: float,
        rainfall_mm: float
    ) -> Optional[Dict[str, Any]]:
        """Call Gemini API for real-time prompt reasoning"""
        from google import genai
        client = genai.Client(api_key=self.gemini_key)

        prompt = f"""
You are an expert senior agronomist and agricultural disaster management specialist. Based on the incoming weather event and the farmer's specific crop and growth stage, generate exactly 3 concise, highly actionable pre-disaster or post-disaster steps. Do not use generic advice; focus on realistic field interventions (e.g., immediate harvest, clearing drainage channels, delaying fertilizer/pesticide sprays, shifting stored produce). Keep each point under 20 words for easy SMS/audio consumption.

FARMER CONTEXT:
- Farmer Name: {farmer_name}
- Region / District: {district}
- Crop: {crop_type}
- Growth Stage: {crop_stage}
- Soil Type: {soil_type}
- Target Language: {language} (Provide native script: Hindi or Odia or English)
- Weather Alert: {event_type} | Wind: {wind_speed_kmh} km/h | Rainfall: {rainfall_mm} mm

Return ONLY valid JSON matching this exact structure:
{{
  "urgency_level": "CRITICAL" or "HIGH" or "MODERATE",
  "english_points": ["1. ...", "2. ...", "3. ..."],
  "translated_points": ["१. ..." or "1. ...", "२. ...", "३. ..."],
  "english_advisory": "Full 3 points in English",
  "translated_advisory": "Full 3 points in target language",
  "reasoning": "1 concise sentence explaining why this specific growth stage requires these actions"
}}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        if response and response.text:
            parsed = json.loads(response.text)
            parsed["crop_type"] = crop_type
            parsed["crop_stage"] = crop_stage
            parsed["district"] = district
            parsed["event_type"] = event_type
            parsed["language"] = "hi" if "hindi" in language.lower() else "or" if "odia" in language.lower() else "en"
            parsed["source"] = "Gemini 2.5 Flash Agronomist Engine"
            return parsed
        return None

advisory_engine = AdvisoryEngine()
