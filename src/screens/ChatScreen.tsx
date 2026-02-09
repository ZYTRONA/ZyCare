import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAudioRecorder, AudioModule } from 'expo-audio';

import { Colors, Typography, Spacing } from '../constants/theme';
import { RootStackParamList } from '../types';
import { aiNurseAPI, speechAPI } from '../services/aiNurse';
import { useAuthStore } from '../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'nurse';
  timestamp: Date;
  language?: string;
}

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state: any) => state.user);
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: `Namaste ${user?.name || 'there'}! 🙏 I'm your AI Nurse Assistant. I can help you in English, தமிழ், or हिंदी. How can I assist you today?`,
      sender: 'nurse',
      timestamp: new Date(),
      language: 'en'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useAudioRecorder({
    android: {
      extension: '.m4a',
      outputFormat: 'mpeg4',
      audioEncoder: 'aac',
      sampleRate: 44100,
    },
    ios: {
      extension: '.m4a',
      audioQuality: 'high',
      sampleRate: 44100,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  } as any);

  useEffect(() => {
    // Request audio permissions on mount
    (async () => {
      await AudioModule.requestRecordingPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await aiNurseAPI.sendMessage(inputMessage, history);

      const nurseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        sender: 'nurse',
        timestamp: new Date(),
        language: response.language
      };

      setMessages((prev) => [...prev, nurseMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or if this is urgent, please consult with a doctor immediately. 🏥",
        sender: 'nurse',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      if (isRecording) {
        // Stop recording
        if (!audioRecorder.isRecording) {
          setIsRecording(false);
          return;
        }
        
        setIsRecording(false);
        const uri = await audioRecorder.stop();
        
        // Check if recording was successful and has a URI
        if (!audioRecorder.uri) {
          Alert.alert('Error', 'Failed to save recording');
          return;
        }
        
        const recordingUri = audioRecorder.uri;

        // Show processing message
        setIsTyping(true);
        
        try {
          // Transcribe audio using Groq Whisper
          const transcriptionResult = await speechAPI.transcribe(recordingUri);
          
          if (transcriptionResult.text) {
            // Send transcribed text as message
            const userMessage: Message = {
              id: Date.now().toString(),
              text: transcriptionResult.text,
              sender: 'user',
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);

            // Get AI response
            const history = messages.slice(-6).map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            }));

            const response = await aiNurseAPI.sendMessage(transcriptionResult.text, history);

            const nurseMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: response.reply,
              sender: 'nurse',
              timestamp: new Date(),
              language: response.language
            };

            setMessages((prev) => [...prev, nurseMessage]);
          } else {
            Alert.alert('No speech detected', 'Please try speaking again.');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          Alert.alert(
            'Transcription Failed',
            'Could not transcribe your voice. Please try again or type your message.'
          );
        } finally {
          setIsTyping(false);
        }
      } else {
        // Start recording
        const { granted } = await AudioModule.requestRecordingPermissionsAsync();
        
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please grant microphone permission to use voice input.'
          );
          return;
        }

        const isCurrentlyRecording = audioRecorder.isRecording;
        if (isCurrentlyRecording) {
          return;
        }

        await audioRecorder.record();
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert(
        'Voice Input Error',
        'Failed to process voice input. Please try again.'
      );
      setIsRecording(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.nurseMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.nurseBubble]}>
          {!isUser && (
            <View style={styles.nurseHeader}>
              <Ionicons name="medical" size={16} color={Colors.primary} />
              <Text style={styles.nurseLabel}>AI Nurse</Text>
            </View>
          )}
          <Text style={[styles.messageText, isUser ? styles.userText : styles.nurseText]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isUser ? styles.userTime : styles.nurseTime]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="medical" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Nurse Assistant</Text>
            <Text style={styles.headerSubtitle}>🇮🇳 English • தமிழ் • हिंदी</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.typingText}>AI Nurse is typing...</Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
            onPress={handleVoiceInput}
            disabled={isTyping}
          >
            <Ionicons 
              name={isRecording ? "stop-circle" : "mic"} 
              size={24} 
              color={isRecording ? Colors.error : Colors.primary} 
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder={isRecording ? "Recording..." : "Type your message... (English/Tamil/Hindi)"}
            placeholderTextColor={Colors.textLight}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={500}
            editable={!isRecording && !isTyping}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
          >
            <Ionicons name="send" size={20} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoButton: {
    marginLeft: Spacing.sm,
  },
  messagesContainer: {
    padding: Spacing.lg,
  },
  messageContainer: {
    marginBottom: Spacing.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  nurseMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  nurseBubble: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  nurseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: 6,
  },
  nurseLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
  messageText: {
    fontSize: Typography.fontSizes.md,
    lineHeight: 20,
  },
  userText: {
    color: Colors.textWhite,
  },
  nurseText: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: Typography.fontSizes.xs,
    marginTop: Spacing.xs,
  },
  userTime: {
    color: Colors.textWhite + 'CC',
    textAlign: 'right',
  },
  nurseTime: {
    color: Colors.textSecondary,
  },
  typingContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
    gap: 8,
  },
  typingText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  voiceButtonRecording: {
    backgroundColor: Colors.error + '20',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
