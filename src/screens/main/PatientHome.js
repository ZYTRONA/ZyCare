import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { Phone, Mic, Activity, Pill, Heart, LogOut, User, Calendar, Clock, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store';

export default function PatientHome({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency',
      'Calling emergency services...',
      [{ text: 'OK' }]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#0088CC" />
      <LinearGradient
        colors={['#0088CC', '#00A8E8']}
        className="pt-12 pb-6"
      >
        {/* User Header */}
        <View className="px-6 flex-row justify-between items-center mb-4">
          <View className="flex-row items-center flex-1">
            <View className="w-16 h-16 bg-white/20 backdrop-blur rounded-full items-center justify-center mr-3">
              <User size={28} color="white" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-xl">{user?.name || 'Patient'}</Text>
              <Text className="text-white/80 text-sm">{user?.phone}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleLogout}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <LogOut size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Emergency Banner */}
        <View className="px-6">
          <TouchableOpacity
            className="bg-red-500 rounded-2xl py-4 px-5 flex-row items-center justify-between"
            onPress={handleEmergency}
            style={{
              shadowColor: '#DC2626',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                <Phone size={24} color="white" />
              </View>
              <Text className="text-white font-bold text-lg">Emergency Ambulance</Text>
            </View>
            <Text className="text-white font-bold text-2xl">108</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 -mt-4">

        {/* AI Nurse Hero */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('AIChat')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA', '#C4B5FD']}
              className="rounded-3xl p-8 items-center"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }}
            >
              <View className="w-32 h-32 bg-white rounded-full items-center justify-center mb-4">
                <Mic size={64} color="#8B5CF6" strokeWidth={2} />
              </View>
              <Text className="text-white text-3xl font-bold mb-2">AI Health Assistant</Text>
              <Text className="text-white text-center text-base opacity-90 mb-3">
                Describe your symptoms in your own words
              </Text>
              <View className="bg-white/20 px-6 py-2 rounded-full">
                <Text className="text-white font-semibold">Tap to Start</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View className="px-6 mb-6">
          <Text className="text-gray-800 font-bold text-xl mb-4">Quick Actions</Text>
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity 
              className="flex-1 mr-2 bg-white rounded-2xl p-5 items-center"
              onPress={() => Alert.alert('Vitals Scanner', 'Feature coming soon! Connect your health devices.')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center mb-3">
                <Activity size={32} color="#0088CC" strokeWidth={2} />
              </View>
              <Text className="text-gray-800 font-bold text-sm">Scan Vitals</Text>
              <Text className="text-gray-500 text-xs mt-1">Coming soon</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 ml-2 bg-white rounded-2xl p-5 items-center"
              onPress={() => Alert.alert('My Medicines', 'Manage your prescriptions and medicine schedule.')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="w-16 h-16 bg-green-50 rounded-2xl items-center justify-center mb-3">
                <Pill size={32} color="#10B981" strokeWidth={2} />
              </View>
              <Text className="text-gray-800 font-bold text-sm">My Medicines</Text>
              <Text className="text-gray-500 text-xs mt-1">Prescriptions</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="flex-1 mr-2 bg-white rounded-2xl p-5 items-center"
              onPress={() => Alert.alert('Appointments', 'View and manage your appointments')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="w-16 h-16 bg-purple-50 rounded-2xl items-center justify-center mb-3">
                <Calendar size={32} color="#8B5CF6" strokeWidth={2} />
              </View>
              <Text className="text-gray-800 font-bold text-sm">Appointments</Text>
              <Text className="text-gray-500 text-xs mt-1">Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 ml-2 bg-white rounded-2xl p-5 items-center"
              onPress={() => Alert.alert('Health Records', 'View your medical history')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="w-16 h-16 bg-orange-50 rounded-2xl items-center justify-center mb-3">
                <TrendingUp size={32} color="#F97316" strokeWidth={2} />
              </View>
              <Text className="text-gray-800 font-bold text-sm">Health Records</Text>
              <Text className="text-gray-500 text-xs mt-1">History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Health Tip */}
        <View className="px-6 mb-6">
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A']}
            className="rounded-2xl p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                <Heart size={24} color="#DC2626" strokeWidth={2} />
              </View>
              <Text className="text-lg font-bold text-gray-800">Daily Health Tip</Text>
            </View>
            <Text className="text-gray-700 leading-6">
              💧 Drink at least 8 glasses of water daily to stay hydrated. Proper hydration helps your body function optimally and supports overall health.
            </Text>
          </LinearGradient>
        </View>

        {/* Recent Activity */}
        <View className="px-6 mb-8">
          <Text className="text-gray-800 font-bold text-xl mb-4">Recent Activity</Text>
          <View 
            className="bg-white rounded-2xl p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="items-center py-4">
              <Clock size={48} color="#9CA3AF" strokeWidth={1.5} />
              <Text className="text-gray-500 mt-3 text-base">No recent consultations</Text>
              <Text className="text-gray-400 text-sm mt-1">Your consultation history will appear here</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
