import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, Text, TouchableOpacity, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { supabase } from '../api/supabaseClient';
import Header from '../components/Header';

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
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="Settings" showBack={true} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Minimal Test</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#333',
              borderRadius: 8,
              padding: 10,
              width: 250,
              fontSize: 18,
              marginBottom: 10,
            }}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#333',
              borderRadius: 8,
              padding: 10,
              width: 250,
              fontSize: 18,
              marginBottom: 20,
            }}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#333',
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 8,
              marginBottom: 30,
            }}
            onPress={handleUpdateProfile}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>Update</Text>
          </TouchableOpacity>

          {/* Change Password Section */}
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Change Password</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#333',
              borderRadius: 8,
              padding: 10,
              width: 250,
              fontSize: 18,
              marginBottom: 10,
            }}
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#333',
              borderRadius: 8,
              padding: 10,
              width: 250,
              fontSize: 18,
              marginBottom: 10,
            }}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#333',
              borderRadius: 8,
              padding: 10,
              width: 250,
              fontSize: 18,
              marginBottom: 20,
            }}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#333',
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 8,
            }}
            onPress={handleUpdatePassword}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SettingsScreen; 