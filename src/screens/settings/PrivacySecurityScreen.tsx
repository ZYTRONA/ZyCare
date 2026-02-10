import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';

export default function PrivacySecurityScreen() {
  const navigation = useNavigation();

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    dataCollection: false,
    twoFactorAuth: false,
    biometricLogin: true,
  });

  const toggleSetting = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password change feature coming soon',
      [{ text: 'OK' }]
    );
  };

  const privacyItems = [
    {
      key: 'profileVisibility',
      title: 'Public Profile',
      description: 'Allow others to view your profile',
      icon: 'eye-outline',
    },
    {
      key: 'dataCollection',
      title: 'Data Analytics',
      description: 'Help us improve by sharing usage data',
      icon: 'analytics-outline',
    },
    {
      key: 'twoFactorAuth',
      title: 'Two-Factor Authentication',
      description: 'Add extra security to your account',
      icon: 'shield-checkmark-outline',
    },
    {
      key: 'biometricLogin',
      title: 'Biometric Login',
      description: 'Use fingerprint or face recognition',
      icon: 'finger-print-outline',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <View style={styles.card}>
            {privacyItems.map((item, index) => (
              <View
                key={item.key}
                style={[
                  styles.settingItem,
                  index < privacyItems.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingContent}>
                  <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.textContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                </View>
                <Switch
                  value={privacy[item.key as keyof typeof privacy]}
                  onValueChange={() => toggleSetting(item.key as keyof typeof privacy)}
                  trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                  thumbColor={privacy[item.key as keyof typeof privacy] ? Colors.primary : Colors.textLight}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Security Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleChangePassword}
            >
              <View style={[styles.iconContainer, { backgroundColor: Colors.warning + '20' }]}>
                <Ionicons name="key-outline" size={20} color={Colors.warning} />
              </View>
              <View style={styles.textContent}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>Update your account password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.settingItemBorder} />

            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                <Ionicons name="shield-outline" size={20} color={Colors.secondary} />
              </View>
              <View style={styles.textContent}>
                <Text style={styles.settingTitle}>Active Sessions</Text>
                <Text style={styles.settingDescription}>Manage your login sessions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.infoText}>Your privacy is important. We never share your personal information without consent.</Text>
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
  headerTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  infoSection: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.info + '15',
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    flex: 1,
  },
});
