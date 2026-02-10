import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { useAuthStore, useLanguageStore } from '../../store';
import { t, LanguageCode } from '../../languages';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock user data
const USER = {
  name: 'John Doe',
  email: 'john.doe@email.com',
  phone: '+1 234 567 8900',
  dateOfBirth: '1990-05-15',
  bloodType: 'O+',
  height: '175 cm',
  weight: '70 kg',
};

const MENU_ITEMS = (language: LanguageCode) => [
  {
    id: 'personal',
    title: 'Personal Information',
    icon: 'person-outline',
    route: null,
    description: 'View and edit your personal details',
  },
  {
    id: 'medical',
    title: 'Medical Records',
    icon: 'document-text-outline',
    route: 'MedicalRecords',
    description: 'Access your medical history and documents',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications-outline',
    route: null,
    description: 'Manage your notification preferences',
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: 'shield-checkmark-outline',
    route: null,
    description: 'Control your privacy settings',
  },
  {
    id: 'help',
    title: 'Help & Support',
    icon: 'help-circle-outline',
    route: null,
    description: 'Get help and contact support',
  },
  {
    id: 'about',
    title: 'About',
    icon: 'information-circle-outline',
    route: null,
    description: 'About ZYCARE and version info',
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.logout);
  const language = useLanguageStore((state: any) => state.language) as LanguageCode;

  const handleLogout = () => {
    Alert.alert(
      t(language, 'profile.logout', 'Logout'),
      t(language, 'profile.confirmLogout', 'Are you sure you want to logout?'),
      [
        { text: t(language, 'common.cancel', 'Cancel'), style: 'cancel' },
        { 
          text: t(language, 'profile.logout', 'Logout'), 
          style: 'destructive',
          onPress: () => {
            logout();
          }
        },
      ]
    );
  };

  const handleMenuItemPress = (menuId: string) => {
    switch (menuId) {
      case 'personal':
        navigation.navigate('PersonalInformation');
        break;
      case 'medical':
        navigation.navigate('MedicalRecords');
        break;
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      case 'privacy':
        navigation.navigate('PrivacySecurity');
        break;
      case 'help':
        navigation.navigate('HelpSupport');
        break;
      case 'about':
        navigation.navigate('About');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={Colors.primary} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={Colors.textWhite} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.phone || 'No phone'}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.role === 'doctor' ? 'Doctor' : 'Patient'}</Text>
              <Text style={styles.statLabel}>Role</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.id?.slice(0, 8) || 'N/A'}</Text>
              <Text style={styles.statLabel}>User ID</Text>
            </View>
          </View>
        </View>

        {/* Health Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthRow}>
              <View style={styles.healthItem}>
                <Ionicons name="water" size={20} color={Colors.error} />
                <Text style={styles.healthLabel}>Blood Type</Text>
                <Text style={styles.healthValue}>N/A</Text>
              </View>
              <View style={styles.healthItem}>
                <Ionicons name="resize-outline" size={20} color={Colors.primary} />
                <Text style={styles.healthLabel}>Height</Text>
                <Text style={styles.healthValue}>N/A</Text>
              </View>
              <View style={styles.healthItem}>
                <Ionicons name="barbell-outline" size={20} color={Colors.secondary} />
                <Text style={styles.healthLabel}>Weight</Text>
                <Text style={styles.healthValue}>N/A</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(language, 'profile.settings', 'Settings')}</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS(language).map((item: any, index: number) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < MENU_ITEMS(language).length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => handleMenuItemPress(item.id)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.menuItemTextContainer}>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          <Text style={styles.logoutButtonText}>{t(language, 'profile.logout', 'Logout')}</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>ZYCARE v1.0.0</Text>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: 20,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.cardBackground,
  },
  userName: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  healthCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  healthItem: {
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  healthValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  menuCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    ...Shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutButtonText: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.error,
    fontWeight: Typography.fontWeights.semibold,
  },
  versionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxxl,
  },
});
