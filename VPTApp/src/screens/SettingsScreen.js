import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, textStyles, layoutStyles, spacing } from '../styles/sharedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Header from '../components/Header';

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearAllFields = () => {
    setName('');
    setUsername('');
    setEmail('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Clear fields when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      clearAllFields();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          setUser(null);
          clearAllFields();
          navigation.navigate('Landing');
          return;
        }
        
        if (user) {
          setUser(user);
          clearAllFields();
          setEmail(user.email || '');
        } else {
          setUser(null);
          clearAllFields();
        }
      } catch (error) {
        console.error('Error getting profile:', error);
        setUser(null);
        clearAllFields();
        navigation.navigate('Landing');
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const handleUpdateProfile = async () => {
    if (!name.trim() && !username.trim()) {
      Alert.alert('Error', 'Please enter a name or username');
      return;
    }
    try {
      let updateError = null;
      // Update name in Auth if provided
      if (name.trim()) {
        const { error } = await supabase.auth.updateUser({
          data: { name: name.trim() }
        });
        if (error) updateError = error;
      }
      // Update name and/or username in userProfile
      const updates = {};
      if (name.trim()) updates.name = name.trim();
      if (username.trim()) updates.username = username.trim();
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('userProfile')
          .update(updates)
          .eq('user_id', user.id);
        if (error) updateError = error;
      }
      if (updateError) throw updateError;
      Alert.alert('Success', 'Profile updated successfully');
      clearAllFields();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message);
      clearAllFields();
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      clearAllFields();
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      clearAllFields();
      return;
    }

    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert('Error', 'Current password is incorrect');
        clearAllFields();
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      Alert.alert('Success', 'Password updated successfully');
      clearAllFields();
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message);
      clearAllFields();
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('userProfile')
                .delete()
                .eq('user_id', user.id);
              if (error) throw error;
              clearAllFields();
              await supabase.auth.signOut();
              navigation.navigate('Landing');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[layoutStyles.container]} edges={['top']}>
      <Header title="Settings" showBack={true} />
      <ScrollView style={styles.content}>
        <SettingSection title="Account Information">
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </SettingSection>

        <SettingSection title="Change Password">
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor={colors.textSecondary}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <Icon 
                name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Icon 
                name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Icon 
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>
        </SettingSection>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]} 
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.subtitle,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: 50,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: spacing.sm,
    color: colors.primary,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.error,
    marginTop: spacing.sm,
  },
  deleteButtonText: {
    color: colors.card,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
});

export default SettingsScreen; 