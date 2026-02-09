import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { authAPI } from '../../services/api.js';
import { useAuthStore } from '../../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const login = useAuthStore((state: any) => state.login);
  
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || !name) {
      Alert.alert('Error', 'Please enter phone number and name');
      return;
    }

    // TEST MODE: Skip API call and use hardcoded OTP
    if (testMode) {
      setOtpSent(true);
      Alert.alert(
        '🧪 TEST MODE - OTP',
        'Use OTP: 1234\n\nTest mode bypasses backend for quick testing.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Sending OTP to:', phone, 'Name:', name, 'Role:', role);
      const response = await authAPI.login(phone, name, role);
      console.log('OTP Response:', response);
      
      if (response.success) {
        setOtpSent(true);
        Alert.alert(
          'OTP Sent Successfully', 
          `Your OTP: ${response.otp}\n\nPhone: ${phone}`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('OTP Send Error:', error);
      console.error('Error details:', error.response?.data);
      
      // Show test mode option
      Alert.alert(
        'Connection Failed', 
        'Cannot reach backend server.\n\nWould you like to use TEST MODE?\n(Uses hardcoded OTP: 1234)',
        [
          {
            text: 'Use Test Mode',
            onPress: () => {
              setTestMode(true);
              setOtpSent(true);
              Alert.alert('🧪 TEST MODE', 'Use OTP: 1234');
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Verifying OTP:', otp, 'for phone:', phone);
      const response = await authAPI.verifyOTP(phone, otp);
      console.log('Verify Response:', response);
      
      if (response.success && response.user) {
        login(response.user);
        Alert.alert('Success', 'Login successful!');
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Error', response.message || 'Invalid OTP');
      }
    } catch (error: any) {
      console.error('OTP Verify Error:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="medical" size={60} color={Colors.primary} />
            </View>
            <Text style={styles.title}>ZYCARE</Text>
            <Text style={styles.subtitle}>
              Your AI-powered health companion
            </Text>
            
            {/* Test Mode Toggle */}
            <TouchableOpacity 
              style={[styles.testModeToggle, testMode && styles.testModeToggleActive]}
              onPress={() => {
                setTestMode(!testMode);
                Alert.alert(
                  testMode ? 'Test Mode Disabled' : '🧪 Test Mode Enabled',
                  testMode 
                    ? 'Switched back to normal mode' 
                    : 'Use OTP: 1234 to login without backend'
                );
              }}
            >
              <Ionicons 
                name={testMode ? "flask" : "flask-outline"} 
                size={20} 
                color={testMode ? "#856404" : Colors.textSecondary} 
              />
              <Text style={[styles.testModeToggleText, testMode && styles.testModeToggleTextActive]}>
                {testMode ? '🧪 Test Mode ON' : 'Enable Test Mode'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Welcome to ZYCARE</Text>
            <Text style={styles.formSubtitle}>
              {otpSent ? (testMode ? '🧪 TEST MODE - Use OTP: 1234' : 'Enter OTP sent to your phone') : 'Enter your details to continue'}
            </Text>
            {testMode && (
              <View style={styles.testModeBadge}>
                <Text style={styles.testModeText}>🧪 Test Mode Active</Text>
              </View>
            )}

            {!otpSent ? (
              <>
                {/* Phone Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number (+1234567890)"
                    placeholderTextColor={Colors.textLight}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={Colors.textLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Role Selection */}
                <View style={styles.roleContainer}>
                  <Text style={styles.roleLabel}>Login as:</Text>
                  <View style={styles.roleButtons}>
                    <TouchableOpacity
                      style={[styles.roleButton, role === 'patient' && styles.roleButtonActive]}
                      onPress={() => setRole('patient')}
                    >
                      <Ionicons 
                        name="person" 
                        size={20} 
                        color={role === 'patient' ? Colors.textWhite : Colors.primary}
                      />
                      <Text style={[styles.roleText, role === 'patient' && styles.roleTextActive]}>
                        Patient
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, role === 'doctor' && styles.roleButtonActive]}
                      onPress={() => setRole('doctor')}
                    >
                      <Ionicons 
                        name="medical" 
                        size={20} 
                        color={role === 'doctor' ? Colors.textWhite : Colors.primary}
                      />
                      <Text style={[styles.roleText, role === 'doctor' && styles.roleTextActive]}>
                        Doctor
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleSendOTP}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* OTP Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 4-digit OTP"
                    placeholderTextColor={Colors.textLight}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleVerifyOTP}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Text>
                </TouchableOpacity>

                {/* Resend OTP */}
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                >
                  <Text style={styles.forgotPasswordText}>Change Phone Number</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Secure Authentication</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Info Text */}
            <View style={styles.registerContainer}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
              <Text style={styles.registerText}> Your data is protected with OTP verification</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  form: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  formTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: Typography.fontSizes.lg,
    color: Colors.textPrimary,
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
  roleContainer: {
    marginBottom: Spacing.xl,
  },
  roleLabel: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
    gap: Spacing.xs,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
  },
  roleText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },
  roleTextActive: {
    color: Colors.textWhite,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  loginButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },
  testModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  testModeToggleActive: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  testModeToggleText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 8,
  },
  testModeToggleTextActive: {
    color: '#856404',
  },
});
