
import { GoogleGenAI, Type } from "@google/genai";
import { Message, RouteStop, TrafficSegment } from "../types";

// Always use the specified initialization format with process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Analyzes current traffic conditions on major Italian motorways using Search Grounding.
   */
  async getTrafficAnalysis(location: string): Promise<{ tip: string; segments: TrafficSegment[] }> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `What is the current traffic status on major highways (Autostrade) near ${location}, Italy? 
                  Provide a short logistics tip and classify 3 major segments as 'Low', 'Moderate', or 'Heavy' intensity.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tip: { type: Type.STRING },
              segments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    intensity: { type: Type.STRING, description: "Low, Moderate, or Heavy" },
                    label: { type: Type.STRING }
                  },
                  required: ["id", "intensity", "label"]
                }
              }
            },
            required: ["tip", "segments"]
          }
        },
      });

      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Traffic analysis failed:", error);
      return { 
        tip: "Normal traffic conditions expected on the current route.",
        segments: [
          { id: "s1", intensity: "Low", label: "A1 North" },
          { id: "s2", intensity: "Moderate", label: "A11 Interchange" },
          { id: "s3", intensity: "Low", label: "A1 South" }
        ]
      };
    }
  },

  /**
   * Analyzes client messages to determine priority and sentiment.
   */
  async analyzeMessage(message: string): Promise<{ priority: string; sentiment: string; suggestedAction: string }> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this message from a car transport client: "${message}". 
                  Determine priority (Low, Medium, High), sentiment (Positive, Neutral, Negative), 
                  and a short suggested professional action.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priority: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              suggestedAction: { type: Type.STRING }
            },
            required: ["priority", "sentiment", "suggestedAction"]
          }
        }
      });
      
      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      return { priority: "Medium", sentiment: "Neutral", suggestedAction: "Review and respond manually." };
    }
  },

  /**
   * Generates route optimization tips based on current stops.
   */
  async optimizeRoute(stops: RouteStop[]): Promise<string> {
    const stopDetails = stops.map(s => `${s.type} ${s.carModel} at ${s.location}`).join(", ");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I have the following stops for my auto-transport business: ${stopDetails}. 
                  Provide a concise (2-3 sentences) logistic tip or warning about this sequence considering general Italian geography and transit efficiency.`,
      });
      return response.text || "Ensure all delivery documents are prepared for the next stop.";
    } catch (error) {
      return "Ensure all delivery documents are prepared for the next stop.";
    }
  },

  /**
   * Generates a professional arrival notification for a client.
   */
  async generateArrivalNotification(stop: RouteStop): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Draft a professional and premium SMS/WhatsApp notification for a client. 
                  Context: WFTransporti is arriving for a ${stop.type}. 
                  Car: ${stop.carModel}. 
                  Location: ${stop.location}. 
                  ETA: ${stop.estimatedTime}.
                  Make it sound high-end and reassuring. Keep it under 160 characters.`,
      });
      return response.text?.trim() || `WFTransporti: We are on track for the ${stop.type} of your ${stop.carModel} at ${stop.location}. Estimated arrival: ${stop.estimatedTime}.`;
    } catch (error) {
      return `WFTransporti: We are on track for the ${stop.type} of your ${stop.carModel} at ${stop.location}. Estimated arrival: ${stop.estimatedTime}.`;
    }
  },

  /**
   * Finds nearby places like gas stations or rest stops using Google Maps grounding.
   */
  async findNearbyPlaces(query: string, lat: number, lng: number): Promise<{ text: string; links: { title: string; uri: string }[] }> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        },
      });

      const text = response.text || "No results found.";
      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter((chunk: any) => chunk.maps)
        ?.map((chunk: any) => ({
          title: chunk.maps.title,
          uri: chunk.maps.uri
        })) || [];

      return { text, links };
    } catch (error) {
      console.error("Maps search failed:", error);
      return { text: "Search currently unavailable.", links: [] };
    }
  }
};
