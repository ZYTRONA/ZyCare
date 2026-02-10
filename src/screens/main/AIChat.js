import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, FlatList, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Mic, Send, Volume2, Globe, ArrowLeft, Bot, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore, useAuthStore } from '../../store';
import { ticketAPI } from '../../services/api';

export default function AIChat({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [severity, setSeverity] = useState(null);
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const user = useAuthStore((state) => state.user);
  const scrollViewRef = useRef();

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputText('');

    try {
      // Call backend to create ticket and analyze
      const response = await ticketAPI.create(user.userId, inputText);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.ai_analysis.summary,
        sender: 'ai',
        timestamp: new Date(),
        severity: response.ai_analysis.severity,
        recommended_action: response.ai_analysis.recommended_action,
      };

      addMessage(aiMessage);
      setSeverity(response.ai_analysis.severity);

      if (response.ai_analysis.severity === 'HIGH') {
        setTimeout(() => {
          Alert.alert(
            'High Priority',
            'Your symptoms require immediate medical attention. Would you like to connect with a doctor?',
            [
              { text: 'Not Now', style: 'cancel' },
              { 
                text: 'Connect Doctor', 
                onPress: () => navigation.navigate('DoctorQueue', { ticketId: response.ticketId })
              },
            ]
          );
        }, 1000);
      }
    } catch (error) {
      addMessage({
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      });
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View
        className={`mb-4 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-2 mt-1">
            <Bot size={18} color="#8B5CF6" />
          </View>
        )}
        <View
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isUser ? 'bg-[#0088CC]' : 'bg-white border-2 border-gray-100'
          }`}
          style={!isUser ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          } : {}}
        >
          <Text className={`text-base ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {item.text}
          </Text>
          {item.severity && (
            <View
              className={`mt-2 px-3 py-1 rounded-full self-start ${
                item.severity === 'HIGH'
                  ? 'bg-red-500'
                  : item.severity === 'MEDIUM'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
            >
              <Text className="text-white text-xs font-bold">
                {item.severity} PRIORITY
              </Text>
            </View>
          )}
          {item.recommended_action && (
            <Text className="text-gray-600 text-sm mt-2 italic">
              {item.recommended_action}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A78BFA']}
        className="px-6 py-4 pt-12 pb-6"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
              <Bot size={28} color="white" strokeWidth={2} />
            </View>
            <View>
              <Text className="text-white text-xl font-bold">AI Health Assistant</Text>
              <Text className="text-white/80 text-sm">Powered by Google Gemini</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={scrollViewRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <View className="w-24 h-24 bg-purple-50 rounded-full items-center justify-center mb-4">
              <Bot size={48} color="#8B5CF6" strokeWidth={1.5} />
            </View>
            <Text className="text-gray-800 text-lg font-bold mb-2">Welcome to AI Health Assistant</Text>
            <Text className="text-gray-600 text-center px-8">
              Describe your symptoms and I'll help analyze them
            </Text>
          </View>
        }
      />

      {/* Action Chips */}
      {severity === 'HIGH' && (
        <View className="px-4 pb-2">
          <TouchableOpacity
            className="bg-red-500 rounded-2xl py-4 px-6 items-center flex-row justify-center"
            onPress={() => navigation.navigate('DoctorQueue')}
            style={{
              shadowColor: '#DC2626',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <AlertCircle size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">Connect with Doctor Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`mr-3 w-10 h-10 rounded-full items-center justify-center ${
              isRecording ? 'bg-red-50' : 'bg-purple-50'
            }`}
            onPress={() => {
              setIsRecording(!isRecording);
              Alert.alert('Voice Input', 'Voice recording feature coming soon!');
            }}
          >
            <Mic size={22} color={isRecording ? '#DC2626' : '#8B5CF6'} />
          </TouchableOpacity>

          <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-2 mr-3">
            <TextInput
              className="text-base text-gray-800 max-h-24"
              placeholder="Type your symptoms..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            className="w-10 h-10 bg-purple-500 rounded-full items-center justify-center"
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            style={{
              opacity: inputText.trim() ? 1 : 0.5,
            }}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
