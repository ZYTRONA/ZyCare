import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
               process.env.EXPO_PUBLIC_API_URL || 
               'http://10.56.198.1:5000';

console.log('🔧 API Configuration:');
console.log('  - API_URL:', API_URL);
console.log('  - Constants:', Constants.expoConfig?.extra);
console.log('  - process.env:', process.env.EXPO_PUBLIC_API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    console.log('📦 Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    console.log('📦 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Data:', error.response.data);
    } else if (error.request) {
      console.error('  - No response received');
      console.error('  - Request:', error.request);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (phone, name, role = 'patient') => {
    console.log('🔐 authAPI.login called with:', { phone, name, role });
    const response = await api.post('/api/auth/login', { phone, name, role });
    return response.data;
  },
  verifyOTP: async (phone, otp) => {
    console.log('🔐 authAPI.verifyOTP called with:', { phone, otp });
    const response = await api.post('/api/auth/verify-otp', { phone, otp });
    return response.data;
  },
};

// Ticket API
export const ticketAPI = {
  create: async (patientId, symptoms) => {
    const response = await api.post('/api/tickets/create', { patientId, symptoms });
    return response.data;
  },
  getQueue: async () => {
    const response = await api.get('/api/tickets/queue');
    return response.data;
  },
  getById: async (ticketId) => {
    const response = await api.get(`/api/tickets/${ticketId}`);
    return response.data;
  },
  updateStatus: async (ticketId, status, doctorId, doctorNotes) => {
    const response = await api.patch(`/api/tickets/${ticketId}/status`, {
      status,
      doctorId,
      doctorNotes,
    });
    return response.data;
  },
};

// User API
export const userAPI = {
  getById: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },
  update: async (userId, data) => {
    const response = await api.patch(`/api/users/${userId}`, data);
    return response.data;
  },
};

// AI Engine URL
const AI_ENGINE_URL = 'http://10.56.198.1:8000';

// AI Symptom Checker API
export const symptomCheckerAPI = {
  analyzeWithImage: async ({ symptoms, duration, additionalInfo, imageUri }) => {
    console.log('🏥 symptomCheckerAPI.analyzeWithImage called with:', { 
      symptoms, 
      duration, 
      additionalInfo, 
      hasImage: !!imageUri 
    });

    const formData = new FormData();
    formData.append('symptoms', symptoms.join(','));
    formData.append('duration', duration);
    formData.append('additional_info', additionalInfo || '');

    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        type: type,
        name: filename || 'medical.jpg'
      });
    }

    try {
      const response = await axios.post(
        `${AI_ENGINE_URL}/analyze-with-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for image processing
        }
      );
      console.log('✅ Image analysis response:', response.data);
      
      // Normalize response to match frontend interface
      const normalizedData = {
        symptoms: response.data.symptoms || [],
        possibleConditions: response.data.possible_conditions || [],
        urgencyLevel: response.data.urgency_level || 'medium',
        recommendations: response.data.recommendations || [],
        suggestedSpecialties: response.data.suggested_specialists || [],
        imageFindings: response.data.image_findings,
        severity: response.data.severity,
        diagnosis: response.data.diagnosis,
      };
      
      return normalizedData;
    } catch (error) {
      console.error('❌ Image analysis error:', error.message);
      if (error.response) {
        console.error('  - Status:', error.response.status);
        console.error('  - Data:', error.response.data);
      }
      throw error;
    }
  },
};

// AI Nurse Chat API
export const aiNurseAPI = {
  sendMessage: async (message, conversationHistory = []) => {
    console.log('💬 aiNurseAPI.sendMessage called with:', { message, historyLength: conversationHistory.length });
    try {
      const response = await axios.post(
        `${AI_ENGINE_URL}/chat`,
        { message, conversation_history: conversationHistory },
        { timeout: 30000 }
      );
      console.log('✅ AI Nurse response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AI Nurse error:', error.message);
      throw error;
    }
  },
};

// Speech API
export const speechAPI = {
  transcribe: async (audioUri) => {
    console.log('🎤 speechAPI.transcribe called with:', audioUri);
    const formData = new FormData();
    
    const filename = audioUri.split('/').pop();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: filename || 'audio.m4a'
    });

    try {
      const response = await axios.post(
        `${AI_ENGINE_URL}/transcribe`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );
      console.log('✅ Transcription response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Transcription error:', error.message);
      throw error;
    }
  },
};

export default api;
