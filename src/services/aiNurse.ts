import axios from 'axios';

const AI_ENGINE_URL = 'http://10.56.198.1:8000';

// AI Nurse Chat API
export const aiNurseAPI = {
  sendMessage: async (message: string, conversationHistory: Array<{role: string, content: string}> = []) => {
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/chat`, {
        message,
        history: conversationHistory
      }, {
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error('AI Nurse Chat Error:', error);
      throw error;
    }
  },

  detectLanguage: async (text: string) => {
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/detect-language`, {
        text
      });
      return response.data;
    } catch (error) {
      console.error('Language detection error:', error);
      return { language: 'en' }; // fallback to English
    }
  }
};

export const speechAPI = {
  // Transcribe audio file using Groq's Whisper model
  transcribe: async (audioUri: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      const response = await axios.post(`${AI_ENGINE_URL}/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for audio processing
      });

      return response.data; // { text: string, language: string }
    } catch (error) {
      console.error('Speech transcription error:', error);
      throw error;
    }
  }
};

