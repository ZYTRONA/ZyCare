import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, StatusBar } from 'react-native';
import { AlertCircle, Users, Video, LogOut, Activity, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ticketAPI } from '../../services/api';
import { useTicketStore, useSocketStore, useAuthStore } from '../../store';
import { io } from 'socket.io-client';

export default function DoctorDashboard({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const ticketQueue = useTicketStore((state) => state.ticketQueue);
  const setTicketQueue = useTicketStore((state) => state.setTicketQueue);
  const addTicketToQueue = useTicketStore((state) => state.addTicketToQueue);
  const socket = useSocketStore((state) => state.socket);
  const setSocket = useSocketStore((state) => state.setSocket);

  useEffect(() => {
    loadQueue();
    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const setupSocket = () => {
    const newSocket = io(process.env.EXPO_PUBLIC_API_URL);
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join_doctor_room');
    });

    newSocket.on('new_patient', (data) => {
      console.log('New patient:', data);
      addTicketToQueue(data);
    });

    setSocket(newSocket);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            if (socket) socket.disconnect();
            logout();
          }
        }
      ]
    );
  };

  const loadQueue = async () => {
    try {
      const queue = await ticketAPI.getQueue();
      setTicketQueue(queue);
    } catch (error) {
      console.error('Error loading queue:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#0088CC" />
      <LinearGradient
        colors={['#0088CC', '#00A8E8']}
        className="pt-12 pb-6"
      >
        {/* Header */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold">Doctor Dashboard</Text>
              <Text className="text-white/80 text-base mt-1">Dr. {user?.name || 'Doctor'}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleLogout}
              className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"
            >
              <LogOut size={22} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Stats Card */}
          <View className="bg-white/20 backdrop-blur rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center mr-4">
              <Users size={24} color="white" strokeWidth={2} />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold">{ticketQueue.length}</Text>
              <Text className="text-white/80 text-sm">Patients Waiting</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Patient Queue */}
      <ScrollView
        className="flex-1 -mt-4 px-6 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-gray-800 text-xl font-bold mb-4">Patient Queue</Text>
        
        {ticketQueue.length === 0 ? (
          <View 
            className="bg-white rounded-3xl p-8 items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Clock size={40} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text className="text-gray-800 font-bold text-lg">No Patients Waiting</Text>
            <Text className="text-gray-500 mt-2 text-center">
              You're all caught up! New patients will appear here.
            </Text>
          </View>
        ) : (
          ticketQueue.map((ticket) => (
            <View
              key={ticket._id || ticket.ticketId}
              className="bg-white rounded-3xl p-6 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Patient Header */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-gray-800 font-bold text-lg mb-1">
                    {ticket.patientName || `Patient #${(ticket.userId || ticket.ticketId)?.slice(-6)}`}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {ticket.patientPhone || new Date(ticket.createdAt).toLocaleTimeString()}
                  </Text>
                </View>
                <View className={`${getSeverityColor(ticket.severity || ticket.ai_analysis?.severity)} px-4 py-2 rounded-full`}>
                  <Text className="text-white font-bold text-xs">
                    {ticket.severity || ticket.ai_analysis?.severity || 'MEDIUM'}
                  </Text>
                </View>
              </View>

              {/* Symptoms */}
              <View className="mb-4">
                <Text className="text-gray-600 font-semibold mb-2 text-sm">Symptoms:</Text>
                <View className="bg-gray-50 rounded-xl p-3">
                  <Text className="text-gray-700 leading-5">{ticket.symptoms}</Text>
                </View>
              </View>

              {/* AI Analysis */}
              {(ticket.aiSummary || ticket.ai_analysis?.summary) && (
                <View className="mb-4">
                  <Text className="text-gray-600 font-semibold mb-2 text-sm">AI Analysis:</Text>
                  <View className="bg-purple-50 rounded-xl p-3 border-2 border-purple-100">
                    <Text className="text-gray-700 leading-5">
                      {ticket.aiSummary || ticket.ai_analysis?.summary}
                    </Text>
                  </View>
                </View>
              )}

              {/* Recommended Action */}
              {(ticket.recommendedAction || ticket.ai_analysis?.recommended_action) && (
                <View className="mb-4">
                  <Text className="text-gray-600 font-semibold mb-2 text-sm">Recommended:</Text>
                  <View className="bg-blue-50 rounded-xl p-3 border-2 border-blue-100">
                    <Text className="text-gray-700 leading-5">
                      {ticket.recommendedAction || ticket.ai_analysis?.recommended_action}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Button */}
              <TouchableOpacity
                className="bg-[#0088CC] rounded-xl py-4 flex-row items-center justify-center"
                onPress={() => navigation.navigate('VideoCall', { ticketId: ticket._id || ticket.ticketId })}
                style={{
                  shadowColor: '#0088CC',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Video size={20} color="white" strokeWidth={2} />
                <Text className="text-white font-bold ml-2 text-base">Start Consultation</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
