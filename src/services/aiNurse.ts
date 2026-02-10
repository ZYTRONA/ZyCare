import axios, { AxiosError } from 'axios';

const AI_ENGINE_URL = 'http://10.56.198.1:8000';

// Helper to format axios errors
const formatAxiosError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      // API responded with error status
      return `API Error ${axiosError.response.status}: ${axiosError.response.statusText}`;
    } else if (axiosError.request) {
      // Request made but no response
      return `Network Error: No response from AI Engine at ${AI_ENGINE_URL}`;
    } else {
      return `Request Error: ${axiosError.message}`;
    }
  }
  return error?.message || 'Unknown error occurred';
};

// AI Nurse Chat API
export const aiNurseAPI = {
  sendMessage: async (message: string, conversationHistory: Array<{role: string, content: string}> = []) => {
    try {
      console.log('💬 aiNurseAPI.sendMessage - Sending to AI Engine:', {
        aiEngineUrl: AI_ENGINE_URL,
        messageLength: message.length,
        historyLength: conversationHistory.length,
      });

      const response = await axios.post(
        `${AI_ENGINE_URL}/chat`,
        {
          message,
          history: conversationHistory
        },
        {
          timeout: 30000,
        }
      );

      console.log('✅ AI Nurse response received:', { replyLength: response.data?.reply?.length });
      return response.data;
    } catch (error: any) {
      const errorMessage = formatAxiosError(error);
      console.error('❌ AI Nurse Chat Error:', {
        error: errorMessage,
        originalError: error?.message,
        aiEngineUrl: AI_ENGINE_URL,
        timestamp: new Date().toISOString(),
      });

      // Provide fallback response when AI engine is unavailable
      console.log('⚠️  AI Engine unavailable. Using fallback response.');
      return {
        reply: `I apologize, but I'm experiencing technical difficulties connecting to my AI systems at the moment. 🔧\n\nHowever, I can still help you:\n\n📝 Common advice for "${message.length > 50 ? message.substring(0, 50) + '...' : message}":\n- Rest and stay hydrated\n- Monitor your symptoms\n- If symptoms persist, consult a doctor\n- In case of emergency, call emergency services immediately\n\nPlease try again in a moment, or feel free to chat with a human doctor. 👨‍⚕️`,
        language: 'en',
        isOffline: true,
      };
    }
  },

  detectLanguage: async (text: string) => {
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/detect-language`, {
        text
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Language detection error:', formatAxiosError(error));
      return { language: 'en' }; // fallback to English
    }
  }
};

export const speechAPI = {
  // Transcribe audio file using Groq's Whisper model
  transcribe: async (audioUri: string) => {
    try {
      console.log('🎤 speechAPI.transcribe - Processing audio:', {
        aiEngineUrl: AI_ENGINE_URL,
        audioUri: audioUri.substring(0, 50) + '...',
      });

      const formData = new FormData();
      const filename = audioUri.split('/').pop() || 'recording.m4a';
      
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: filename,
      } as any);

      const response = await axios.post(
        `${AI_ENGINE_URL}/transcribe`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for audio processing
        }
      );

      console.log('✅ Transcription response received:', {
        textLength: response.data?.text?.length,
        language: response.data?.language,
      });
      
      return response.data; // { text: string, language: string }
    } catch (error: any) {
      const errorMessage = formatAxiosError(error);
      console.error('❌ Speech transcription error:', {
        error: errorMessage,
        originalError: error?.message,
        aiEngineUrl: AI_ENGINE_URL,
        timestamp: new Date().toISOString(),
      });

      // Throw error so ChatScreen can handle it with alert
      throw new Error(`Transcription failed: ${errorMessage}`);
    }
  }
};

