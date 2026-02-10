import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { Colors, Typography, Spacing, Shadows, COMMON_SYMPTOMS } from '../constants/theme';
import { RootStackParamList, Symptom, AISymptomAnalysis, PossibleCondition } from '../types';
import { symptomCheckerAPI } from '../services/api.js';
import { useAuthStore, useLanguageStore } from '../store';
import { t, LanguageCode } from '../languages';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SymptomCheckerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state: any) => state.user);
  const language = useLanguageStore((state: any) => state.language) as LanguageCode;
  const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [duration, setDuration] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AISymptomAnalysis | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library permission to upload medical images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permission to take photos of medical conditions.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const startAnalysis = async () => {
    setStep('analyzing');

    // Animate pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    try {
      // Build symptom description for backend
      const symptomNames = selectedSymptoms
        .map((id) => COMMON_SYMPTOMS.find((s) => s.id === id)?.name)
        .filter(Boolean) as string[];
      
      // Call backend API with image if provided
      const response = await symptomCheckerAPI.analyzeWithImage({
        symptoms: symptomNames,
        duration: duration || '2-3 days',
        additionalInfo,
        imageUri: selectedImage,
      });
      
      pulseAnim.stopAnimation();
      
      // Ensure urgencyLevel exists with default value
      const normalizedResponse = {
        ...response,
        urgencyLevel: response.urgencyLevel || 'medium',
        suggestedSpecialties: response.suggestedSpecialties || [],
        possibleConditions: response.possibleConditions || [],
      };
      
      setAnalysisResult(normalizedResponse as AISymptomAnalysis);
      setStep('results');
      
      // Alert for high severity
      const urgency = normalizedResponse.urgencyLevel;
      if (urgency === 'high' || urgency === 'emergency') {
        setTimeout(() => {
          Alert.alert(
            'High Priority',
            'Your symptoms require medical attention. Would you like to connect with a doctor?',
            [
              { text: 'Not Now', style: 'cancel' },
              { 
                text: 'Find Doctors', 
                onPress: () => navigation.navigate('Doctors' as any)
              },
            ]
          );
        }, 500);
      }
    } catch (error: any) {
      pulseAnim.stopAnimation();
      console.error('Symptom analysis error:', error);
      
      let errorMessage = 'Failed to analyze symptoms. Please try again.';
      
      // Provide more specific error messages
      if (error.response) {
        if (error.response.status === 500) {
          errorMessage = 'Server error during analysis. The AI engine may be processing. Please try again in a moment.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid request. Please check your symptoms and try again.';
        } else if (error.response.data?.detail) {
          errorMessage = `Analysis error: ${error.response.data.detail}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Analysis Error', 
        errorMessage,
        [
          { text: 'Try Again', onPress: () => setStep('input') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      setStep('input');
    }
  };

  const resetChecker = () => {
    setStep('input');
    setSelectedSymptoms([]);
    setAdditionalInfo('');
    setDuration('');
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'low':
        return Colors.severityLow;
      case 'medium':
        return Colors.severityMedium;
      case 'high':
      case 'emergency':
        return Colors.severityHigh;
      default:
        return Colors.textSecondary;
    }
  };

  const renderSymptomInputStep = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.aiHeader}>
        <View style={styles.aiIconContainer}>
          <Ionicons name="sparkles" size={32} color={Colors.textWhite} />
        </View>
        <Text style={styles.aiTitle}>AI Symptom Checker</Text>
        <Text style={styles.aiSubtitle}>
          Select your symptoms and our AI will analyze them to provide insights
          and recommendations
        </Text>
      </View>

      {/* Symptoms Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Your Symptoms</Text>
        <Text style={styles.sectionSubtitle}>
          Tap on all symptoms you're experiencing
        </Text>
        <View style={styles.symptomsGrid}>
          {COMMON_SYMPTOMS.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            return (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomChip,
                  isSelected && styles.symptomChipSelected,
                ]}
                onPress={() => toggleSymptom(symptom.id)}
              >
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                  size={18}
                  color={isSelected ? Colors.textWhite : Colors.primary}
                />
                <Text
                  style={[
                    styles.symptomChipText,
                    isSelected && styles.symptomChipTextSelected,
                  ]}
                >
                  {symptom.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <Text style={styles.sectionSubtitle}>
          How long have you been experiencing these symptoms?
        </Text>
        <View style={styles.durationOptions}>
          {['Less than 24 hrs', '1-3 days', '4-7 days', 'More than a week'].map(
            (option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.durationChip,
                  duration === option && styles.durationChipSelected,
                ]}
                onPress={() => setDuration(option)}
              >
                <Text
                  style={[
                    styles.durationChipText,
                    duration === option && styles.durationChipTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Additional Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <Text style={styles.sectionSubtitle}>
          Describe any other symptoms or concerns (optional)
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="E.g., I also have a mild headache that comes and goes..."
          placeholderTextColor={Colors.textLight}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
        />
      </View>
      {/* Medical Image Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Medical Image (Optional)</Text>
        <Text style={styles.sectionSubtitle}>
          Upload or take a photo of affected area for AI visual analysis
        </Text>
        
        {selectedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
            <View style={styles.imageLabel}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.imageLabelText}>Image uploaded - AI will analyze</Text>
            </View>
          </View>
        ) : (
          <View style={styles.imageUploadButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={takePicture}>
              <Ionicons name="camera" size={24} color={Colors.primary} />
              <Text style={styles.imageButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="images" size={24} color={Colors.primary} />
              <Text style={styles.imageButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* Analyze Button */}
      <TouchableOpacity
        style={[
          styles.analyzeButton,
          selectedSymptoms.length === 0 && styles.analyzeButtonDisabled,
        ]}
        onPress={startAnalysis}
        disabled={selectedSymptoms.length === 0}
      >
        <Ionicons name="analytics" size={22} color={Colors.textWhite} />
        <Text style={styles.analyzeButtonText}>Analyze Symptoms</Text>
      </TouchableOpacity>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={20} color={Colors.textSecondary} />
        <Text style={styles.disclaimerText}>
          This AI analysis is for informational purposes only and should not
          replace professional medical advice. Always consult a healthcare
          provider for accurate diagnosis.
        </Text>
      </View>
    </ScrollView>
  );

  const renderAnalyzingStep = () => (
    <View style={styles.analyzingContainer}>
      <Animated.View
        style={[
          styles.analyzingCircle,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Ionicons name="sparkles" size={48} color={Colors.textWhite} />
      </Animated.View>
      <Text style={styles.analyzingTitle}>Analyzing Your Symptoms</Text>
      <Text style={styles.analyzingSubtitle}>
        Our AI is processing your symptoms to provide personalized insights...
      </Text>
      <View style={styles.analyzingSteps}>
        <View style={styles.analyzingStep}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.analyzingStepText}>Symptoms collected</Text>
        </View>
        <View style={styles.analyzingStep}>
          <Ionicons name="sync" size={20} color={Colors.primary} />
          <Text style={styles.analyzingStepText}>Analyzing patterns...</Text>
        </View>
        <View style={styles.analyzingStep}>
          <Ionicons name="ellipse-outline" size={20} color={Colors.textLight} />
          <Text style={[styles.analyzingStepText, { color: Colors.textLight }]}>
            Generating recommendations
          </Text>
        </View>
      </View>
    </View>
  );

  const renderResultsStep = () => {
    if (!analysisResult) return null;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Urgency Level */}
        <View
          style={[
            styles.urgencyCard,
            { backgroundColor: getUrgencyColor(analysisResult.urgencyLevel) + '20' },
          ]}
        >
          <View
            style={[
              styles.urgencyIconContainer,
              { backgroundColor: getUrgencyColor(analysisResult.urgencyLevel) },
            ]}
          >
            <Ionicons
              name={
                analysisResult.urgencyLevel === 'low'
                  ? 'checkmark-circle'
                  : analysisResult.urgencyLevel === 'medium'
                  ? 'alert-circle'
                  : 'warning'
              }
              size={28}
              color={Colors.textWhite}
            />
          </View>
          <View style={styles.urgencyContent}>
            <Text style={styles.urgencyLabel}>Urgency Level</Text>
            <Text
              style={[
                styles.urgencyLevel,
                { color: getUrgencyColor(analysisResult.urgencyLevel || 'medium') },
              ]}
            >
              {analysisResult.urgencyLevel 
                ? analysisResult.urgencyLevel.charAt(0).toUpperCase() + analysisResult.urgencyLevel.slice(1)
                : 'Medium'}
            </Text>
          </View>
        </View>

        {/* Image Analysis Results */}
        {analysisResult.imageFindings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Visual Analysis</Text>
            <View style={styles.imageFindingsCard}>
              <View style={styles.imageFindingsHeader}>
                <Ionicons name="eye" size={24} color={Colors.primary} />
                <Text style={styles.imageFindingsTitle}>What AI Detected in Image:</Text>
              </View>
              <Text style={styles.imageFindingsText}>{analysisResult.imageFindings}</Text>
              {selectedImage && (
                <View style={styles.analyzedImagePreview}>
                  <Image source={{ uri: selectedImage }} style={styles.analyzedImage} />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Possible Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Possible Conditions</Text>
          {analysisResult.possibleConditions.map((condition, index) => (
            <View key={index} style={styles.conditionCard}>
              <View style={styles.conditionHeader}>
                <Text style={styles.conditionName}>{condition.name}</Text>
                <View style={styles.probabilityContainer}>
                  <Text style={styles.probabilityText}>{condition.probability}%</Text>
                </View>
              </View>
              <View style={styles.probabilityBar}>
                <View
                  style={[
                    styles.probabilityFill,
                    { width: `${condition.probability}%` },
                  ]}
                />
              </View>
              <Text style={styles.conditionDescription}>{condition.description}</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationsCard}>
            {analysisResult.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={styles.recommendationNumber}>
                  <Text style={styles.recommendationNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Suggested Specialists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Specialists</Text>
          <View style={styles.specialistsContainer}>
            {analysisResult.suggestedSpecialties.map((specialty, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.specialistCard}
                onPress={() => {
                  // Navigate back to MainTabs and switch to Doctors tab with filter
                  navigation.navigate('MainTabs', { 
                    screen: 'Doctors', 
                    params: { filterSpecialty: specialty } 
                  });
                }}
              >
                <Ionicons name="medical" size={24} color={Colors.primary} />
                <Text style={styles.specialistText}>{specialty}</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.consultButton}>
            <Ionicons name="videocam" size={22} color={Colors.textWhite} />
            <Text style={styles.consultButtonText}>Consult a Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetChecker}>
            <Ionicons name="refresh" size={22} color={Colors.primary} />
            <Text style={styles.resetButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle" size={20} color={Colors.textSecondary} />
          <Text style={styles.disclaimerText}>
            This AI analysis is for informational purposes only. Please consult
            a healthcare professional for accurate diagnosis and treatment.
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      {step === 'input' && renderSymptomInputStep()}
      {step === 'analyzing' && renderAnalyzingStep()}
      {step === 'results' && renderResultsStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  aiHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  aiIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  aiTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  aiSubtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  symptomChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  symptomChipText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  symptomChipTextSelected: {
    color: Colors.textWhite,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  durationChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationChipText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  durationChipTextSelected: {
    color: Colors.textWhite,
  },
  textArea: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  analyzeButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  analyzeButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  disclaimerText: {
    flex: 1,
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  // Analyzing Step
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  analyzingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  analyzingTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  analyzingSubtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  analyzingSteps: {
    alignSelf: 'stretch',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: Spacing.xl,
  },
  analyzingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  analyzingStepText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
  },
  // Results Step
  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  urgencyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgencyContent: {
    marginLeft: Spacing.md,
  },
  urgencyLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  urgencyLevel: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  conditionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  conditionName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  probabilityContainer: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  probabilityText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  probabilityBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  conditionDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  recommendationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  recommendationNumberText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textWhite,
  },
  recommendationText: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  specialistsContainer: {
    gap: Spacing.md,
  },
  specialistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  specialistText: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  actionButtons: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
  },
  consultButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resetButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
  imageUploadButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  imageButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.primary,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.textWhite,
    borderRadius: 12,
  },
  imageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    backgroundColor: Colors.success + '20',
  },
  imageLabelText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.success,
    fontWeight: Typography.fontWeights.medium,
  },
  imageFindingsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  imageFindingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  imageFindingsTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  imageFindingsText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  analyzedImagePreview: {
    marginTop: Spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  analyzedImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
});
