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

export default function AboutScreen() {
  const navigation = useNavigation();

  const features = [
    { icon: 'calendar-outline', title: 'Easy Appointments', description: 'Book doctor appointments in seconds' },
    { icon: 'videocam-outline', title: 'Video Consultation', description: 'Connect with doctors via video call' },
    { icon: 'documents-outline', title: 'Digital Records', description: 'Store and manage medical records' },
    { icon: 'analytics-outline', title: 'AI Symptoms Checker', description: 'Get preliminary health insights' },
    { icon: 'pills-outline', title: 'Prescription Management', description: 'Track and manage prescriptions' },
    { icon: 'heart-outline', title: 'Health Tracking', description: 'Monitor your health metrics' },
  ];

  const links = [
    { title: 'Terms of Service', url: 'https://zycare.com/terms' },
    { title: 'Privacy Policy', url: 'https://zycare.com/privacy' },
    { title: 'Contact Us', url: 'mailto:hello@zycare.com' },
    { title: 'Website', url: 'https://zycare.com' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About ZYCARE</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={[styles.card, styles.appInfoCard]}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>Z</Text>
            </View>
            <Text style={styles.appName}>ZYCARE</Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.tagline}>Your Partner in Digital Health</Text>
          </View>
        </View>

        {/* About Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <View style={[styles.card, styles.descriptionCard]}>
            <Text style={styles.description}>
              ZYCARE is a comprehensive digital health platform designed to make healthcare more 
              accessible, affordable, and convenient. We connect patients with experienced healthcare 
              professionals through innovative technology.
            </Text>
            <Text style={styles.description}>
              Our mission is to revolutionize healthcare delivery and empower individuals to take 
              control of their health journey.
            </Text>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.card}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureItem,
                  index < features.length - 1 && styles.featureItemBorder,
                ]}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: Colors.primary + '20' }]}>
                  <Ionicons name={feature.icon as any} size={20} color={Colors.primary} />
                </View>
                <View style={styles.featureTextContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Important Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Links</Text>
          <View style={styles.card}>
            {links.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.linkItem,
                  index < links.length - 1 && styles.linkItemBorder,
                ]}
                onPress={() => {
                  if (link.url.startsWith('mailto:')) {
                    Linking.openURL(link.url);
                  } else {
                    Linking.openURL(link.url);
                  }
                }}
              >
                <Text style={styles.linkTitle}>{link.title}</Text>
                <Ionicons name="open-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.section}>
          <View style={[styles.card, styles.footerCard]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={Colors.primary} />
            <Text style={styles.footerTitle}>Secure & Trustworthy</Text>
            <Text style={styles.footerText}>
              Your health data is encrypted and protected with industry-standard security measures.
            </Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>© 2024 ZYCARE. All rights reserved.</Text>
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
  appInfoCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logo: {
    fontSize: 32,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textWhite,
  },
  appName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  versionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  tagline: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  descriptionCard: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  description: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'flex-start',
  },
  featureItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: Spacing.xs,
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  linkItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkTitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },
  footerCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginVertical: Spacing.md,
  },
  footerText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  copyright: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  copyrightText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textLight,
  },
});
