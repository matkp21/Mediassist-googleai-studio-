import { GoogleGenAI, Type, ThinkingLevel, Modality, Chat } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
let activeChat: Chat | null = null;

export const getGeminiClient = () => {
    if (!aiInstance) {
        aiInstance = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    }
    return aiInstance;
};

export interface ChatOptions {
  modelType: 'general' | 'fast' | 'complex' | 'vision';
  useSearch?: boolean;
}

export const executeGeminiAction = async (prompt: string, options: ChatOptions = { modelType: 'general' }, files?: Array<{mimeType: string, data: string}>): Promise<string> => {
  const ai = getGeminiClient();
  let model = "gemini-3-flash-preview";
  let toolConfig: any = undefined;
  let config: any = {
      systemInstruction: "You are Medi, the Resident Genius Mentor of MediAssistant. You are a highly knowledgeable medical resident, an advanced AI designed to help medical students and doctors with health queries, medical learning, and case analysis. Be empathetic, highly accurate, and use a Socratic teaching style when appropriate. Do not provide definitive medical diagnoses replacing a real doctor."
  };

  if (options.modelType === 'fast') {
      model = "gemini-3.1-flash-lite-preview";
  } else if (options.modelType === 'complex') {
      model = "gemini-3.1-pro-preview";
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  } else if (options.modelType === 'vision' || (files && files.length > 0)) {
       // Force pro preview for video/image understanding
      model = "gemini-3.1-pro-preview";
  }

  if (options.useSearch) {
      config.tools = [{ googleSearch: {} }];
      if (model === "gemini-3.1-flash-lite-preview") { 
          // Flash lite doesn't officially support grounding as well as flash, we will use generic flash to be safe if search is toggled
          model = "gemini-3-flash-preview";
      }
  }

  // Handle media/vision (must use generateContent because chat session doesnt easily mix multimodal state correctly without robust mapping)
  if (files && files.length > 0) {
      const parts: any[] = files.map(file => ({ inlineData: { mimeType: file.mimeType, data: file.data } }));
      parts.push({ text: prompt });
      const response = await ai.models.generateContent({
          model,
          contents: { parts },
          config,
      });
      return response.text || "No response received.";
  }

  // Initialize or re-initialize chat if the model logic changes significantly
  if (!activeChat || activeChat.model !== model) {
      activeChat = ai.chats.create({
          model,
          config
      });
  }

  try {
      // Use multi-turn chat for text
      const response = await activeChat.sendMessage({ message: prompt });
      return response.text || "No response received.";
  } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "An error occurred while connecting to the Gemini chatbot.";
  }
};

export const generateTTS = async (text: string): Promise<string | null> => {
   const ai = getGeminiClient();
   try {
       const response = await ai.models.generateContent({
           model: "gemini-3.1-flash-tts-preview",
           contents: [{ parts: [{ text }] }],
           config: {
               responseModalities: [Modality.AUDIO],
               speechConfig: {
                   voiceConfig: {
                       prebuiltVoiceConfig: { voiceName: 'Kore' },
                   },
               },
           },
       });
       const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
       return base64Audio || null;
   } catch (error) {
       console.error("TTS generation error:", error);
       return null;
   }
};
