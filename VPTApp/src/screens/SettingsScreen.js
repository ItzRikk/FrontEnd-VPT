import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, Text, TouchableOpacity, Alert, TouchableWithoutFeedback, Keyboard, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../api/supabaseClient';
import Header from '../components/Header';
import { colors, spacing, textStyles } from '../styles/sharedStyles';

const SettingsScreen = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  console.log('SettingsScreen rendered');

  const handleUpdateProfile = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Error', 'Could not get user');
        return;
      }
      // Update userProfile
      const updates = {};
      if (name.trim()) updates.name = name.trim();
      if (username.trim()) updates.username = username.trim();
      if (Object.keys(updates).length === 0) {
        Alert.alert('Error', 'Please enter a name or username');
        return;
      }
      const { error } = await supabase
        .from('userProfile')
        .update(updates)
        .eq('user_id', user.id);
      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Error', 'Could not get user');
        return;
      }
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (updateError) throw updateError;
      Alert.alert('Success', 'Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.background}>
        <Header title="Settings" showBack={true} />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
                textContentType="name"
                importantForAutofill="no"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="username"
                importantForAutofill="no"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                placeholderTextColor={colors.textSecondary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="password"
                importantForAutofill="no"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor={colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="newPassword"
                importantForAutofill="no"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="newPassword"
                importantForAutofill="no"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
              <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...textStyles.subtitle,
    color: colors.primary,
    marginBottom: spacing.md,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 