import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing } from '../constants/theme';
import { languages, LanguageCode, t } from '../languages';
import { useLanguageStore } from '../store';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LanguageSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const language = useLanguageStore((state: any) => state.language);
  const setLanguage = useLanguageStore((state: any) => state.setLanguage);

  const handleLanguageSelect = (selectedLanguage: LanguageCode) => {
    setLanguage(selectedLanguage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t(language as LanguageCode, 'common.selectLanguage')}</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Language Options */}
        <View style={styles.languagesContainer}>
          {Object.entries(languages).map(([code, lang]: [string, any]) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.languageCard,
                language === code && styles.languageCardSelected,
              ]}
              onPress={() => handleLanguageSelect(code as LanguageCode)}
            >
              <View style={styles.languageContent}>
                <Text style={[styles.languageName, language === code && styles.languageNameSelected]}>
                  {lang.nativeName}
                </Text>
                <Text style={[styles.languageCode, language === code && styles.languageCodeSelected]}>
                  {lang.name}
                </Text>
              </View>
              {language === code && (
                <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            {t(language as LanguageCode, 'common.languageChanged')}
          </Text>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  languagesContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  languageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  languageCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  languageNameSelected: {
    color: Colors.primary,
  },
  languageCode: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  languageCodeSelected: {
    color: Colors.primary,
  },
  descriptionContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary + '10',
    marginHorizontal: Spacing.xl,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: Typography.fontWeights.medium,
  },
});
