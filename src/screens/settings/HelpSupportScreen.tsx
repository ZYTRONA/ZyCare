import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';

export default function HelpSupportScreen() {
  const navigation = useNavigation();

  const supportItems = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: 'help-circle-outline',
      onPress: () => {},
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'mail-outline',
      onPress: () => Linking.openURL('mailto:support@zycare.com'),
    },
    {
      id: 'live',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'chatbubbles-outline',
      onPress: () => {},
    },
    {
      id: 'call',
      title: 'Call Support',
      description: 'Speak with a representative',
      icon: 'call-outline',
      onPress: () => {},
    },
  ];

  const topics = [
    { title: 'How to book an appointment', icon: 'calendar-outline' },
    { title: 'Understanding your medical records', icon: 'document-text-outline' },
    { title: 'Video consultation guide', icon: 'videocam-outline' },
    { title: 'Using AI Symptom Checker', icon: 'analytics-outline' },
    { title: 'Payment and billing', icon: 'card-outline' },
    { title: 'Privacy and security', icon: 'shield-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Support</Text>
          <View style={styles.card}>
            {supportItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.supportItem,
                  index < supportItems.length - 1 && styles.supportItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.supportTitle}>{item.title}</Text>
                  <Text style={styles.supportDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Common Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Topics</Text>
          <View style={styles.card}>
            {topics.map((topic, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.topicItem,
                  index < topics.length - 1 && styles.topicItemBorder,
                ]}
              >
                <Ionicons name={topic.icon as any} size={18} color={Colors.primary} />
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.section}>
          <View style={[styles.card, styles.hoursCard]}>
            <Ionicons name="time-outline" size={28} color={Colors.primary} style={styles.hoursIcon} />
            <Text style={styles.hoursTitle}>Support Hours</Text>
            <Text style={styles.hoursText}>Monday - Friday: 9:00 AM - 6:00 PM IST</Text>
            <Text style={styles.hoursText}>Saturday: 10:00 AM - 4:00 PM IST</Text>
            <Text style={styles.hoursText}>Sunday: Closed</Text>
          </View>
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
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  supportItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  supportTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  supportDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  topicItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topicTitle: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
  },
  hoursCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  hoursIcon: {
    marginBottom: Spacing.md,
  },
  hoursTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  hoursText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginVertical: Spacing.xs,
  },
});
