import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { mapProfile, updateProfile, uploadProfileImage, deleteProfileImage } from '@/lib/auth';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { user, setUser } = useAuth();
  const mapped = mapProfile(user);
  const [firstName, setFirstName] = useState(mapped?.firstName || '');
  const [lastName, setLastName] = useState(mapped?.lastName || '');
  const [email, setEmail] = useState(mapped?.email || '');
  const [phone, setPhone] = useState(mapped?.phone || '');
  const [profileImage, setProfileImage] = useState<string | null>(mapped?.profileImage || null);
  const [pickedAsset, setPickedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const next = mapProfile(user);
    if (!next) return;
    setFirstName(next.firstName);
    setLastName(next.lastName);
    setEmail(next.email);
    setPhone(next.phone || '');
    setProfileImage(next.profileImage);
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      setPickedAsset(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera to take a profile picture.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      setPickedAsset(result.assets[0]);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Change Profile Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      {
        text: 'Remove photo',
        style: 'destructive',
        onPress: async () => {
          try {
            const saved = await deleteProfileImage();
            setUser(saved);
            setProfileImage(null);
            setPickedAsset(null);
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Could not remove photo.');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      let savedUser = user;
      const isLocalPhoto = Boolean(
        profileImage &&
          (profileImage.startsWith('file:') ||
            profileImage.startsWith('content:') ||
            profileImage.startsWith('ph:') ||
            profileImage.startsWith('blob:') ||
            profileImage.startsWith('data:') ||
            pickedAsset),
      );
      if (isLocalPhoto && profileImage) {
        const asset = pickedAsset;
        const mime = asset?.mimeType === 'image/jpg' ? 'image/jpeg' : asset?.mimeType || 'image/jpeg';
        savedUser = await uploadProfileImage({
          uri: asset?.uri || profileImage,
          name: asset?.fileName || 'profile-image.jpg',
          type: mime,
        });
      }
      savedUser = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      setUser(savedUser);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <PageHeader title="Edit Profile" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScreenScroll
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            bounces={false}
            contentStyle={styles.scrollContent}
          >
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={showImageOptions} activeOpacity={0.8}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar}>
                    <ThemedText style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</ThemedText>
                  </View>
                )}
                <View style={[styles.cameraIcon, { borderColor: colors.background }]}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: colors.card }]} onPress={showImageOptions}>
                <ThemedText style={[styles.changePhotoText, { color: colors.tint }]}>Change Photo</ThemedText>
              </TouchableOpacity>
            </View>

            <AppCard style={styles.formCard}>
              <TextInput label="First Name" placeholder="Enter first name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              <TextInput label="Last Name" placeholder="Enter last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              <TextInput label="Email" placeholder="Enter email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={false} />
              <TextInput label="Phone Number" placeholder="Enter phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
            </AppCard>
            <PrimaryButton title={isLoading ? 'Saving...' : 'Save Changes'} onPress={handleSave} disabled={isLoading} />
          </ScreenScroll>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4338CA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4338CA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  changePhotoButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    marginBottom: 20,
  },
});
