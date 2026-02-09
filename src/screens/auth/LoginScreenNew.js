import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';
import { Mic, Globe, Shield, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';

export default function LoginScreenNew({ navigation }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [language, setLanguage] = useState('en');
  const login = useAuthStore((state) => state.login);

  const handleGetOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setShowOTP(true);
    Alert.alert('OTP Sent', 'Check your phone for OTP (use 123456 for demo)');
  };

  const handleVerifyOTP = async () => {
    try {
      const verified = await authAPI.verifyOTP(phone, otp);
      if (verified.success) {
        const userData = await authAPI.login(phone, 'User', 'patient');
        login(userData);
        navigation.replace(userData.role === 'doctor' ? 'DoctorDashboard' : 'PatientHome');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#0088CC" />
      <LinearGradient
        colors={['#0088CC', '#00A8E8', '#40C4FF']}
        className="pt-16 pb-8 px-6"
      >
        {/* Logo & Branding */}
        <View className="items-center">
          <View className="w-28 h-28 bg-white/20 backdrop-blur rounded-full items-center justify-center mb-4">
            <Heart size={48} color="white" strokeWidth={2} />
          </View>
          <Text className="text-white text-4xl font-bold mb-2">ZYCARE</Text>
          <Text className="text-white/90 text-base">Your AI Healthcare Companion</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 -mt-6">
        {/* Login Card */}
        <View className="bg-white rounded-3xl p-6 shadow-lg">
          <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</Text>
          
          {/* Phone Input */}
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-semibold text-sm">Phone Number</Text>
            <View className="flex-row items-center bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4">
              <Text className="text-gray-700 mr-3 font-bold">+91</Text>
              <TextInput
                className="flex-1 text-base text-gray-800"
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
              />
            </View>
          </View>

          {/* OTP Input */}
          {showOTP && (
            <View className="mb-5">
              <Text className="text-gray-700 mb-2 font-semibold text-sm">Enter OTP</Text>
              <TextInput
                className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-base text-gray-800"
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
              />
              <Text className="text-gray-500 text-xs mt-2">Demo OTP: 123456</Text>
            </View>
          )}

          {/* Get OTP / Verify Button */}
          <TouchableOpacity
            className="bg-[#0088CC] rounded-xl py-4 items-center mb-4 shadow-md"
            onPress={showOTP ? handleVerifyOTP : handleGetOTP}
            style={{
              shadowColor: '#0088CC',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white font-bold text-lg">
              {showOTP ? 'Verify OTP' : 'Get OTP'}
            </Text>
          </TouchableOpacity>

          {/* Language Toggle */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 bg-gray-50 rounded-xl"
            onPress={toggleLanguage}
          >
            <Globe size={20} color="#0088CC" />
            <Text className="ml-2 text-[#0088CC] font-semibold">
              {language === 'en' ? 'Switch to Tamil' : 'ஆங்கிலத்திற்கு மாற'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features Showcase */}
        <View className="mt-8 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
              <Shield size={24} color="#0088CC" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-base">AI-Powered Diagnosis</Text>
              <Text className="text-gray-600 text-sm">Instant symptom analysis</Text>
            </View>
          </View>
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mr-4">
              <Heart size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-base">24/7 Healthcare</Text>
              <Text className="text-gray-600 text-sm">Connect with doctors anytime</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-purple-50 rounded-full items-center justify-center mr-4">
              <Mic size={24} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-base">Voice Support</Text>
              <Text className="text-gray-600 text-sm">Speak in your language</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
