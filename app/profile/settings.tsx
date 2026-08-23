import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Switch,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/contexts/theme-context';
import { ThemedText } from '@/components/themed-text';
import { TextInput } from '@/components/ui/text-input';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const LANGUAGES = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { id: 'hi', name: 'Hindi', native: 'हिंदी' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు' },
  { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { id: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { id: 'mr', name: 'Marathi', native: 'मराठी' },
  { id: 'bn', name: 'Bengali', native: 'বাংলা' },
  { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
];

export default function SettingsScreen() {
  const { colors, isDark, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      if (settings) {
        const data = JSON.parse(settings);
        setEmailNotifications(data.emailNotifications !== false);
        setAutoPlay(data.autoPlay || false);
        setDownloadOverWifi(data.downloadOverWifi !== false);
        if (data.language) {
          const lang = LANGUAGES.find(l => l.id === data.language);
          if (lang) setSelectedLanguage(lang);
        }
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      const data = settings ? JSON.parse(settings) : {};
      data[key] = value;
      await AsyncStorage.setItem('appSettings', JSON.stringify(data));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleLanguageSelect = (language: typeof LANGUAGES[0]) => {
    setSelectedLanguage(language);
    saveSettings('language', language.id);
    setShowLanguageModal(false);
    Alert.alert(
      'Language Changed',
      `App language changed to ${language.name}. Some content may require restart to update.`,
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // TODO: Implement actual password change API call
    Alert.alert('Success', 'Password changed successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setShowPasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    ]);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.backIcon, { color: colors.text }]}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Settings</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingIcon}>🌙</ThemedText>
              <View style={styles.settingTextContainer}>
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</ThemedText>
                <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {isDark ? 'Enabled' : 'Disabled'}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#e5e5ea', true: colors.tint }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Language Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Language</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingIcon}>🌐</ThemedText>
              <View style={styles.settingTextContainer}>
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>App Language</ThemedText>
                <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {selectedLanguage.name} ({selectedLanguage.native})
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.linkArrow, { color: colors.textMuted }]}>›</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingIcon}>🔒</ThemedText>
              <View style={styles.settingTextContainer}>
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>Change Password</ThemedText>
                <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>Update your password</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.linkArrow, { color: colors.textMuted }]}>›</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingIcon}>📧</ThemedText>
              <ThemedText style={[styles.settingLabel, { color: colors.text }]}>Email Notifications</ThemedText>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={(value) => {
                setEmailNotifications(value);
                saveSettings('emailNotifications', value);
              }}
              trackColor={{ false: '#e5e5ea', true: colors.tint }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Content Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Content</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingIcon}>▶️</ThemedText>
              <ThemedText style={[styles.settingLabel, { color: colors.text }]}>Auto-play Videos</ThemedText>
            </View>
            <Switch
              value={autoPlay}
              onValueChange={(value) => {
                setAutoPlay(value);
                saveSettings('autoPlay', value);
              }}
              trackColor={{ false: '#e5e5ea', true: colors.tint }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingIcon}>📥</ThemedText>
              <ThemedText style={[styles.settingLabel, { color: colors.text }]}>Download over WiFi only</ThemedText>
            </View>
            <Switch
              value={downloadOverWifi}
              onValueChange={(value) => {
                setDownloadOverWifi(value);
                saveSettings('downloadOverWifi', value);
              }}
              trackColor={{ false: '#e5e5ea', true: colors.tint }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Other Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Other</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.linkItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingIcon}>🗑️</ThemedText>
              <ThemedText style={[styles.settingLabel, { color: colors.text }]}>Clear Cache</ThemedText>
            </View>
            <ThemedText style={[styles.linkArrow, { color: colors.textMuted }]}>›</ThemedText>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <ThemedText style={[styles.appVersion, { color: colors.textSecondary }]}>App Version 1.0.0</ThemedText>
          <ThemedText style={[styles.appCopyright, { color: colors.textMuted }]}>© 2026 FusionCraft</ThemedText>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Select Language</ThemedText>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <ThemedText style={[styles.modalClose, { color: colors.textSecondary }]}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    { borderBottomColor: colors.border },
                    selectedLanguage.id === item.id && { backgroundColor: colors.background },
                  ]}
                  onPress={() => handleLanguageSelect(item)}
                >
                  <View>
                    <ThemedText
                      style={[
                        styles.languageName,
                        { color: selectedLanguage.id === item.id ? colors.tint : colors.text },
                        selectedLanguage.id === item.id && styles.languageNameSelected,
                      ]}
                    >
                      {item.name}
                    </ThemedText>
                    <ThemedText style={[styles.languageNative, { color: colors.textSecondary }]}>{item.native}</ThemedText>
                  </View>
                  {selectedLanguage.id === item.id && (
                    <ThemedText style={[styles.checkmark, { color: colors.tint }]}>✓</ThemedText>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidModal}
          >
            <View style={[styles.passwordModalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Change Password</ThemedText>
                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                  <ThemedText style={[styles.modalClose, { color: colors.textSecondary }]}>✕</ThemedText>
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.passwordForm}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
              <TextInput
                label="Current Password"
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <TextInput
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <TextInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.changePasswordButton, { backgroundColor: colors.tint }]}
                onPress={handleChangePassword}
              >
                <ThemedText style={styles.changePasswordText}>Change Password</ThemedText>
              </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpace: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a2e',
  },
  settingDescription: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  linkArrow: {
    fontSize: 20,
    color: '#c7c7cc',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  appVersion: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#c7c7cc',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidModal: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  passwordModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  modalClose: {
    fontSize: 20,
    color: '#8e8e93',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  languageItemSelected: {
    backgroundColor: '#667eea10',
  },
  languageName: {
    fontSize: 16,
    color: '#1a1a2e',
    marginBottom: 2,
  },
  languageNameSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
  languageNative: {
    fontSize: 13,
    color: '#8e8e93',
  },
  checkmark: {
    fontSize: 18,
    color: '#667eea',
    fontWeight: '700',
  },
  passwordForm: {
    padding: 20,
  },
  changePasswordButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
