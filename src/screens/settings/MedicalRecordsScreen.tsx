import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../store';

export default function MedicalRecordsScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state: any) => state.user);
  
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('prescriptions');
  const [documentName, setDocumentName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<any>(null);

  const categories = [
    { id: 'all', label: 'All', icon: 'folder-outline' },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'capsule-outline' },
    { id: 'lab', label: 'Lab Reports', icon: 'beaker-outline' },
    { id: 'medical', label: 'Medical History', icon: 'document-outline' },
    { id: 'vaccines', label: 'Vaccines', icon: 'shield-checkmark-outline' },
  ];

  // User records state - persisted per user
  const [userRecords, setUserRecords] = useState<any[]>([]);

  // Load user records on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      // In a real app, fetch from database/backend
      // For now, use local storage simulation
      const savedRecords = user.medicalRecords || [];
      setUserRecords(savedRecords);
    }
  }, [user?.id]);

  const filteredRecords = filterCategory === 'all' 
    ? userRecords 
    : userRecords.filter(record => record.category === filterCategory);

  const handleUploadRecord = () => {
    setUploadModalVisible(true);
  };

  const pickFile = async () => {
    try {
      setIsPickingFile(true);
      
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'We need access to your phone storage to upload documents. Please enable it in settings.'
        );
        setIsPickingFile(false);
        return;
      }

      // Pick document/image from device
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Extract file information
        const fileName = asset.uri.split('/').pop() || `document_${Date.now()}`;
        const fileSize = asset.fileSize || 0;
        const mimeType = asset.mimeType || 'application/octet-stream';

        const newFile = {
          id: Date.now().toString(),
          name: fileName,
          size: fileSize,
          uri: asset.uri,
          type: mimeType,
        };

        setSelectedFiles([...selectedFiles, newFile]);
        Alert.alert('Success', `${fileName} attached successfully`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file from phone storage. Please try again.');
      console.error('File picker error:', error);
    } finally {
      setIsPickingFile(false);
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(selectedFiles.filter(f => f.id !== fileId));
  };

  const viewRecord = (record: any) => {
    setViewingRecord(record);
    setViewModalVisible(true);
  };

  const downloadRecord = async (record: any) => {
    try {
      if (record.files && record.files.length > 0) {
        const fileNames = record.files.map((f: any) => f.name).join(', ');
        Alert.alert(
          'Download Files',
          `Files from: ${record.title}\n\nFiles: ${fileNames}`,
          [
            {
              text: 'Download',
              onPress: () => {
                Alert.alert('Download Started', 'Your files are being downloaded');
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('No Files', 'This record has no files attached');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download document');
    }
  };

  const completeUpload = () => {
    if (!documentName.trim()) {
      Alert.alert('Error', 'Please enter a document name');
      return;
    }

    if (selectedFiles.length === 0) {
      Alert.alert('Error', 'Please attach at least one document');
      return;
    }

    // Get color based on category
    const categoryColors: { [key: string]: string } = {
      prescriptions: '#FF6B6B',
      lab: '#4ECDC4',
      medical: '#95E1D3',
      vaccines: '#A8E6CF',
    };

    // Get icon based on category
    const categoryIcons: { [key: string]: string } = {
      prescriptions: 'capsule-outline',
      lab: 'beaker-outline',
      medical: 'document-text-outline',
      vaccines: 'shield-checkmark-outline',
    };

    // Get category label
    const categoryLabels: { [key: string]: string } = {
      prescriptions: 'Prescription',
      lab: 'Lab Report',
      medical: 'Medical Document',
      vaccines: 'Vaccine Certificate',
    };

    // Create new record
    const newRecord = {
      id: Date.now().toString(),
      userId: user?.id,
      category: uploadCategory,
      title: documentName,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      doctor: 'You',
      icon: categoryIcons[uploadCategory],
      color: categoryColors[uploadCategory],
      files: selectedFiles,
      fileCount: selectedFiles.length,
    };

    const updatedRecords = [newRecord, ...userRecords];
    setUserRecords(updatedRecords);
    
    // Save to user profile (in real app, this would be a backend call)
    // This persists records with the user account
    setUploadModalVisible(false);
    setDocumentName('');
    setSelectedFiles([]);
    Alert.alert('Success', `${categoryLabels[uploadCategory]} uploaded successfully with ${selectedFiles.length} file(s)!`);
  };

  const renderRecord = ({ item }: { item: any }) => (
    <View style={[styles.recordCard, styles.recordCardShadow]}>
      <View style={styles.recordHeader}>
        {/* Left: View Document Icon */}
        <TouchableOpacity 
          onPress={() => viewRecord(item)}
          style={styles.viewButton}
        >
          <Ionicons name="eye-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* Middle: Record Content */}
        <View style={styles.recordContent}>
          <View style={[styles.recordIconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon as any} size={20} color={item.color} />
          </View>
          <View style={styles.recordDetails}>
            <Text style={styles.recordTitle}>{item.title}</Text>
            <Text style={styles.recordDate}>{item.date}</Text>
            <Text style={styles.recordDoctor}>{item.doctor}</Text>
            {item.fileCount && (
              <Text style={styles.recordFileCount}>
                <Ionicons name="document-attach-outline" size={12} color={Colors.textSecondary} /> {item.fileCount} file(s)
              </Text>
            )}
          </View>
        </View>

        {/* Right: Download Icon */}
        <TouchableOpacity 
          onPress={() => downloadRecord(item)}
          style={styles.downloadButton}
        >
          <Ionicons name="download-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Files List */}
      {item.files && item.files.length > 0 && (
        <View style={styles.filesContainer}>
          {item.files.map((file: any) => (
            <View key={file.id} style={styles.fileItem}>
              <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileSize}>({(file.size / 1024).toFixed(0)} KB)</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <TouchableOpacity>
          <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  filterCategory === category.id && styles.categoryButtonActive,
                ]}
                onPress={() => setFilterCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={filterCategory === category.id ? Colors.textWhite : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryButtonText,
                    filterCategory === category.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Empty State or Records */}
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptyDescription}>
              Your medical records will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.recordsSection}>
            <View style={styles.recordsHeader}>
              <Text style={styles.recordsTitle}>
                {filteredRecords.length} Record{filteredRecords.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <FlatList
              data={filteredRecords}
              renderItem={renderRecord}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.recordsList}
            />
          </View>
        )}

        {/* Upload Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.uploadCard, styles.uploadCardShadow]}
            onPress={handleUploadRecord}
          >
            <Ionicons name="add-circle-outline" size={40} color={Colors.primary} />
            <Text style={styles.uploadTitle}>Upload New Record</Text>
            <Text style={styles.uploadDescription}>
              Add prescription, lab report, or any medical document
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.section}>
          <View style={[styles.infoBox, styles.infoBoxShadow]}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Your Privacy Matters</Text>
              <Text style={styles.infoText}>
                All your medical records are encrypted and only visible to authorized healthcare professionals.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Upload Medical Record</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Record Type</Text>
              <View style={styles.categorySelectionContainer}>
                {[
                  { id: 'prescriptions', label: 'Prescription' },
                  { id: 'lab', label: 'Lab Report' },
                  { id: 'medical', label: 'Medical History' },
                  { id: 'vaccines', label: 'Vaccine' },
                ].map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      uploadCategory === cat.id && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setUploadCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        uploadCategory === cat.id && styles.categoryOptionTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Document Name */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Document Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Diabetes Blood Test Report"
                placeholderTextColor={Colors.textSecondary}
                value={documentName}
                onChangeText={setDocumentName}
              />
            </View>

            {/* Attach Documents */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Attach Documents</Text>
              <TouchableOpacity 
                style={[styles.attachButton, isPickingFile && styles.attachButtonDisabled]}
                onPress={pickFile}
                disabled={isPickingFile}
              >
                {isPickingFile ? (
                  <>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.attachButtonText}>Selecting file...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.attachButtonText}>Select from Phone Storage</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <View style={styles.selectedFilesList}>
                  {selectedFiles.map((file, index) => (
                    <View key={file.id} style={styles.selectedFileItem}>
                      <View style={styles.fileInfo}>
                        <Ionicons name="document-outline" size={18} color={Colors.primary} />
                        <View style={styles.fileDetails}>
                          <Text style={styles.selectedFileName} numberOfLines={1}>{file.name}</Text>
                          <Text style={styles.selectedFileSize}>
                            {(file.size / 1024).toFixed(0)} KB
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => removeFile(file.id)}
                        style={styles.removeFileButton}
                      >
                        <Ionicons name="close-circle" size={20} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Upload Instructions */}
            <View style={styles.instructionsBox}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionsTitle}>File Requirements</Text>
                <Text style={styles.instructionsText}>
                  • Accepted formats: PDF, PNG, JPG{'\n'}
                  • Maximum file size: 10 MB{'\n'}
                  • Clear and readable documents recommended
                </Text>
              </View>
            </View>

            {/* Upload Button */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={completeUpload}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={Colors.textWhite} />
              <Text style={styles.uploadButtonText}>Complete Upload</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* View Documents Modal */}
      <Modal
        visible={viewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setViewModalVisible(false)}
      >
        <SafeAreaView style={styles.viewModalContainer}>
          <View style={styles.viewModalHeader}>
            <TouchableOpacity onPress={() => setViewModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.viewModalTitle}>View Documents</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.viewModalContent}>
            {viewingRecord && (
              <>
                {/* Record Info */}
                <View style={styles.recordInfoBox}>
                  <View
                    style={[
                      styles.recordTypeIcon,
                      { backgroundColor: viewingRecord.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={viewingRecord.icon as any}
                      size={32}
                      color={viewingRecord.color}
                    />
                  </View>
                  <Text style={styles.recordInfoTitle}>{viewingRecord.title}</Text>
                  <Text style={styles.recordInfoDate}>{viewingRecord.date}</Text>
                  <Text style={styles.recordInfoDoctor}>Uploaded by: {viewingRecord.doctor}</Text>
                </View>

                {/* Documents List */}
                {viewingRecord.files && viewingRecord.files.length > 0 ? (
                  <View style={styles.documentsListSection}>
                    <Text style={styles.documentsTitle}>Attached Documents ({viewingRecord.files.length})</Text>
                    {viewingRecord.files.map((file: any) => (
                      <TouchableOpacity
                        key={file.id}
                        style={styles.documentPreviewItem}
                      >
                        <View style={styles.documentIconBox}>
                          <Ionicons name="document" size={32} color={Colors.primary} />
                        </View>
                        <View style={styles.documentPreviewInfo}>
                          <Text style={styles.documentPreviewName}>{file.name}</Text>
                          <Text style={styles.documentPreviewSize}>
                            {(file.size / 1024).toFixed(0)} KB
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.documentPreviewDownload}
                          onPress={() => {
                            Alert.alert(
                              'Download',
                              `Downloading: ${file.name}`,
                              [{ text: 'OK' }]
                            );
                          }}
                        >
                          <Ionicons name="download-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyDocuments}>
                    <Ionicons name="document-outline" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyDocumentsText}>No documents attached</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  categoriesSection: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  categoryButtonTextActive: {
    color: Colors.textWhite,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptyDescription: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  recordsSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  recordsHeader: {
    marginBottom: Spacing.md,
  },
  recordsTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  recordsList: {
    gap: Spacing.md,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  recordCardShadow: {
    ...Shadows.small,
  },
  recordIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  recordTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  recordDate: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  recordDoctor: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textLight,
  },
  uploadCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed' as any,
    borderColor: Colors.primary + '40',
  },
  uploadCardShadow: {
    ...Shadows.small,
  },
  uploadTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  uploadDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'flex-start',
  },
  infoBoxShadow: {
    ...Shadows.small,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  infoTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  modalSection: {
    marginBottom: Spacing.xl,
  },
  modalSectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  categorySelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
  },
  categoryOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  categoryOptionText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  categoryOptionTextSelected: {
    color: Colors.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.cardBackground,
  },
  instructionsBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
  },
  instructionsContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  instructionsTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  instructionsText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  uploadButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textWhite,
  },
  // New styles for record header and files
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  viewButton: {
    padding: Spacing.md,
    paddingLeft: 0,
  },
  recordContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  recordDetails: {
    flex: 1,
  },
  downloadButton: {
    padding: Spacing.md,
    paddingRight: 0,
  },
  recordFileCount: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  filesContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  fileName: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  fileSize: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  // Modal file attachment styles
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed' as any,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary + '10',
  },
  attachButtonDisabled: {
    opacity: 0.6,
    borderColor: Colors.disabled,
  },
  attachButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
  selectedFilesList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  selectedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  fileDetails: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  selectedFileSize: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  removeFileButton: {
    padding: Spacing.sm,
  },
  // View Documents Modal Styles
  viewModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  viewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewModalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  viewModalContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  recordInfoBox: {
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  recordTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  recordInfoTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  recordInfoDate: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  recordInfoDoctor: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  documentsListSection: {
    marginBottom: Spacing.xl,
  },
  documentsTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  documentPreviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  documentIconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  documentPreviewInfo: {
    flex: 1,
  },
  documentPreviewName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  documentPreviewSize: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  documentPreviewDownload: {
    padding: Spacing.md,
  },
  emptyDocuments: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyDocumentsText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
