import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../store';

export default function PersonalInformationScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state: any) => state.user);
  const updateUser = useAuthStore((state: any) => state.updateUser);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    bloodType: user?.bloodType || '',
    height: user?.height || '',
    weight: user?.weight || '',
    gender: user?.gender || '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()
  );

  const handleDateConfirm = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    setFormData({ ...formData, dateOfBirth: formattedDate });
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  // Sync form data with user data whenever user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        bloodType: user.bloodType || '',
        height: user.height || '',
        weight: user.weight || '',
        gender: user.gender || '',
      });
      if (user.dateOfBirth) {
        setSelectedDate(new Date(user.dateOfBirth));
      }
    }
  }, [user]);

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    Alert.alert('Success', 'Personal information updated successfully');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons name={isEditing ? 'close' : 'pencil'} size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={64} color={Colors.primary} />
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={20} color={Colors.textWhite} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <View style={styles.card}>
            {/* Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.name}
                onChangeText={(value) => setFormData({ ...formData, name: value })}
                editable={isEditing}
              />
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.email}
                onChangeText={(value) => setFormData({ ...formData, email: value })}
                editable={isEditing}
                keyboardType="email-address"
              />
            </View>

            {/* Phone */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.phone}
                onChangeText={(value) => setFormData({ ...formData, phone: value })}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              {isEditing ? (
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.input, styles.datePickerButton]}
                >
                  <Text style={styles.datePickerText}>
                    {formData.dateOfBirth || 'Select date'}
                  </Text>
                  <Ionicons name="calendar" size={20} color={Colors.primary} />
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={formData.dateOfBirth || 'Not set'}
                  editable={false}
                />
              )}
            </View>

            {/* Gender */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Gender</Text>
              {isEditing ? (
                <View style={styles.genderContainer}>
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderButton,
                        formData.gender === gender && styles.genderButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, gender })}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          formData.gender === gender && styles.genderButtonTextSelected,
                        ]}
                      >
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={formData.gender || 'Not set'}
                  editable={false}
                />
              )}
            </View>

            {/* Blood Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Blood Type</Text>
              {isEditing ? (
                <View style={styles.bloodTypeContainer}>
                  {['A', 'B', 'AB', 'O'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.bloodTypeButton,
                        formData.bloodType === type && styles.bloodTypeButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, bloodType: type })}
                    >
                      <Text
                        style={[
                          styles.bloodTypeButtonText,
                          formData.bloodType === type && styles.bloodTypeButtonTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={formData.bloodType || 'Not set'}
                  editable={false}
                />
              )}
            </View>

            {/* Height */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.height}
                onChangeText={(value) => setFormData({ ...formData, height: value })}
                editable={isEditing}
                keyboardType="numeric"
                placeholder="e.g., 180"
              />
            </View>

            {/* Weight */}
            <View style={[styles.fieldContainer, { marginBottom: 0 }]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.weight}
                onChangeText={(value) => setFormData({ ...formData, weight: value })}
                editable={isEditing}
                keyboardType="numeric"
                placeholder="e.g., 75"
              />
            </View>

            {/* Address */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
                value={formData.address}
                onChangeText={(value) => setFormData({ ...formData, address: value })}
                editable={isEditing}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Health Information Section */}
        <View style={styles.section}>
          <View style={styles.healthHeader}>
            <Ionicons name="heart" size={24} color={Colors.primary} />
            <Text style={styles.healthTitle}>Health Information</Text>
          </View>
          <View style={styles.healthCard}>
            {/* Health Info Grid */}
            <View style={styles.healthGrid}>
              {/* Blood Type */}
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>Blood Type</Text>
                <View style={styles.healthValueBox}>
                  <Text style={styles.healthValue}>
                    {formData.bloodType || 'Not set'}
                  </Text>
                </View>
              </View>

              {/* Height */}
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>Height</Text>
                <View style={styles.healthValueBox}>
                  <Text style={styles.healthValue}>
                    {formData.height ? `${formData.height} cm` : 'Not set'}
                  </Text>
                </View>
              </View>

              {/* Weight */}
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>Weight</Text>
                <View style={styles.healthValueBox}>
                  <Text style={styles.healthValue}>
                    {formData.weight ? `${formData.weight} kg` : 'Not set'}
                  </Text>
                </View>
              </View>

              {/* Gender */}
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>Gender</Text>
                <View style={styles.healthValueBox}>
                  <Text style={styles.healthValue}>
                    {formData.gender || 'Not set'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        {/* Date Picker Modal */}
        <DatePicker
          modal
          open={showDatePicker}
          date={selectedDate}
          onConfirm={handleDateConfirm}
          onCancel={handleDateCancel}
          mode="date"
          title="Select Date of Birth"
          confirmText="Confirm"
          cancelText="Cancel"
          maximumDate={new Date()}
        />
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
  keyboardAvoid: {
    flex: 1,
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
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '25%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: Colors.background,
    color: Colors.textSecondary,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  saveButton: {
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    ...Shadows.medium,
  },
  saveButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  datePickerText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  genderButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  genderButtonTextSelected: {
    color: Colors.textWhite,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  bloodTypeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  bloodTypeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bloodTypeButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  bloodTypeButtonTextSelected: {
    color: Colors.textWhite,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  healthTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  healthCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  healthItem: {
    flex: 1,
    minWidth: '45%',
  },
  healthLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  healthValueBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  healthValue: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
});
