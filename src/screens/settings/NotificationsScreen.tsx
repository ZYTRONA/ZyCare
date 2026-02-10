import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';

export default function NotificationsScreen() {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    prescriptionUpdates: true,
    testResults: true,
    doctorMessages: true,
    promotions: false,
    systemUpdates: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationItems = [
    {
      key: 'appointmentReminders',
      title: 'Appointment Reminders',
      description: 'Get reminders before your appointments',
      icon: 'calendar-outline',
    },
    {
      key: 'prescriptionUpdates',
      title: 'Prescription Updates',
      description: 'Notifications about new prescriptions',
      icon: 'pill-outline',
    },
    {
      key: 'testResults',
      title: 'Test Results',
      description: 'Alerts when test results are ready',
      icon: 'flask-outline',
    },
    {
      key: 'doctorMessages',
      title: 'Doctor Messages',
      description: 'Messages from your doctors',
      icon: 'chatbubbles-outline',
    },
    {
      key: 'promotions',
      title: 'Promotions & Offers',
      description: 'Special deals and promotional offers',
      icon: 'gift-outline',
    },
    {
      key: 'systemUpdates',
      title: 'System Updates',
      description: 'Important app updates and maintenance news',
      icon: 'refresh-outline',
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.card}>
            {notificationItems.map((item, index) => (
              <View
                key={item.key}
                style={[
                  styles.notificationItem,
                  index < notificationItems.length - 1 && styles.notificationItemBorder,
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.textContent}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationDescription}>{item.description}</Text>
                  </View>
                </View>
                <Switch
                  value={notifications[item.key as keyof typeof notifications]}
                  onValueChange={() => toggleNotification(item.key as keyof typeof notifications)}
                  trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                  thumbColor={notifications[item.key as keyof typeof notifications] ? Colors.primary : Colors.textLight}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.infoText}>You can manage these settings at any time. Changes take effect immediately.</Text>
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
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.small,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  notificationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notificationContent: {
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
  notificationTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  notificationDescription: {
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
