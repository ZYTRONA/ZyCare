import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { RootStackParamList, Doctor, Appointment } from '../../types';
import { useAuthStore, useLanguageStore } from '../../store';
import { appointmentsAPI } from '../../services/api';
import { t, LanguageCode } from '../../languages';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QUICK_SERVICES = [
  { id: '1', name: 'home.aiSymptomChecker', icon: 'analytics', color: Colors.primary, route: 'SymptomChecker' },
  { id: '2', name: 'home.aiNurseChat', icon: 'chatbubbles', color: '#10B981', route: 'Chat' },
  { id: '3', name: 'home.findDoctors', icon: 'medical', color: Colors.secondary, route: 'Doctors' },
  { id: '4', name: 'home.bookAppointment', icon: 'calendar', color: Colors.accent, route: 'Doctors' },
  { id: '5', name: 'home.videoCall', icon: 'videocam', color: '#8B5CF6', route: 'VideoCall' },
  { id: '6', name: 'home.medicalRecords', icon: 'document-text', color: Colors.info, route: 'MedicalRecords' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state: any) => state.user);
  const language = useLanguageStore((state: any) => state.language);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      setIsLoadingAppointments(true);
      setAppointmentError(null);
      
      if (!user?.id) {
        console.log('⚠️ No user ID available. User object:', user);
        setIsLoadingAppointments(false);
        return;
      }
      
      try {
        console.log('📅 Fetching upcoming appointments for user:', user.id);
        const response = await appointmentsAPI.getUpcoming(user.id);
        console.log('✅ Appointments fetched:', response);
        
        // Response is already an array of appointments
        setUpcomingAppointments(response);
      } catch (err: any) {
        console.error('❌ Error fetching appointments:', err);
        // API will have tried fallback - silently handle
        setAppointmentError(null);
        setUpcomingAppointments([]);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchUpcomingAppointments();
  }, [user?.id]);

  const upcomingAppointment = upcomingAppointments[0]; // Get first upcoming appointment

  const handleServicePress = useCallback((route: string) => {
    if (route === 'SymptomChecker') {
      navigation.navigate('SymptomChecker');
    } else if (route === 'Chat') {
      navigation.navigate('Chat');
    } else if (route === 'VideoCall') {
      navigation.navigate('VideoCall', {});
    } else if (route === 'MedicalRecords') {
      navigation.navigate('MedicalRecords');
    } else if (route === 'Doctors') {
      navigation.navigate('MainTabs', { screen: 'Doctors' });
    }
  }, [navigation]);

  const renderQuickService = useCallback(({ item }: { item: typeof QUICK_SERVICES[0] }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(item.route)}
    >
      <View style={[styles.serviceIconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={28} color={item.color} />
      </View>
      <Text style={styles.serviceName}>{t(language as LanguageCode, item.name)}</Text>
    </TouchableOpacity>
  ), [language, handleServicePress]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t(language as LanguageCode, 'home.hello')}</Text>
            <Text style={styles.username}>{user?.name || 'Guest'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={useCallback(() => navigation.navigate('LanguageSelection'), [navigation])}
            >
              <Ionicons name="globe-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>{t(language as LanguageCode, 'home.searchPlaceholder')}</Text>
        </TouchableOpacity>

        {/* AI Health Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => navigation.navigate('SymptomChecker')}
        >
          <View style={styles.aiBannerContent}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={28} color={Colors.textWhite} />
            </View>
            <View style={styles.aiBannerText}>
              <Text style={styles.aiBannerTitle}>{t(language as LanguageCode, 'home.aiHealthAssistant')}</Text>
              <Text style={styles.aiBannerSubtitle}>
                {t(language as LanguageCode, 'home.aiHealthDescription')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textWhite} />
        </TouchableOpacity>

        {/* Quick Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(language as LanguageCode, 'home.quickServices')}</Text>
          <FlatList
            horizontal
            data={QUICK_SERVICES}
            renderItem={renderQuickService}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          />
        </View>

        {/* Upcoming Appointment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t(language as LanguageCode, 'appointments.upcomingAppointment')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Appointments' })}>
              <Text style={styles.seeAllText}>{t(language as LanguageCode, 'common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingAppointments ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>{t(language as LanguageCode, 'common.loading')}</Text>
            </View>
          ) : upcomingAppointment ? (
            <TouchableOpacity style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.doctorAvatar}>
                  <Ionicons name="person" size={24} color={Colors.primary} />
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentDoctorName}>
                    {upcomingAppointment.doctorName}
                  </Text>
                  <Text style={styles.appointmentDoctorSpecialty}>
                    {upcomingAppointment.doctorSpecialty}
                  </Text>
                </View>
                <View style={[styles.appointmentType, { backgroundColor: Colors.primary + '20' }]}>
                  <Ionicons name={upcomingAppointment.type === 'video' ? 'videocam' : 'phone-portrait'} size={16} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.appointmentDetails}>
                <View style={styles.appointmentDetailItem}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.appointmentDetailText}>
                    {upcomingAppointment.date}
                  </Text>
                </View>
                <View style={styles.appointmentDetailItem}>
                  <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.appointmentDetailText}>
                    {upcomingAppointment.time}
                  </Text>
                </View>
              </View>
              <View style={styles.appointmentActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    Alert.alert(
                      t(language as LanguageCode, 'appointments.cancelAppointment'),
                      t(language as LanguageCode, 'appointments.confirmCancel'),
                      [
                        { text: t(language as LanguageCode, 'common.no'), style: 'cancel' },
                        { text: t(language as LanguageCode, 'common.yes'), style: 'destructive', onPress: () => {
                          // TODO: Call cancel API
                          Alert.alert(t(language as LanguageCode, 'common.cancelled'), t(language as LanguageCode, 'appointments.cancelledSuccess'));
                        }}
                      ]
                    );
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t(language as LanguageCode, 'common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => navigation.navigate('Consultation', { appointmentId: upcomingAppointment.id })}
                >
                  <Text style={styles.joinButtonText}>{t(language as LanguageCode, 'appointments.joinCall')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noAppointmentCard}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textLight} />
              <Text style={styles.noAppointmentText}>{t(language as LanguageCode, 'appointments.noUpcoming')}</Text>
              <Text style={styles.noAppointmentSubtext}>{t(language as LanguageCode, 'appointments.noUpcomingDescription')}</Text>
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Doctors' })}
              >
                <Text style={styles.bookButtonText}>{t(language as LanguageCode, 'home.bookAppointment')}</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  languageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  greeting: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  username: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    ...Shadows.small,
  },
  searchPlaceholder: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.xl,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  aiBannerText: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textWhite,
    marginBottom: Spacing.xs,
  },
  aiBannerSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  servicesContainer: {
    paddingHorizontal: Spacing.lg,
  },
  serviceCard: {
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    width: 80,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  serviceName: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: Typography.fontWeights.medium,
  },
  appointmentCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  appointmentDoctorName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  appointmentDoctorSpecialty: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  appointmentType: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentDetails: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  appointmentDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  appointmentDetailText: {
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  joinButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textWhite,
    fontWeight: Typography.fontWeights.medium,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: 12,
    padding: Spacing.md,
    ...Shadows.small,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  doctorName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  ratingText: {
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  experienceText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  doctorFee: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  loadingContainer: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  loadingText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  noAppointmentCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.small,
  },
  noAppointmentText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  noAppointmentSubtext: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 10,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textWhite,
    fontWeight: Typography.fontWeights.semibold,
  },
});
