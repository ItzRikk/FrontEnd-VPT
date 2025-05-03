import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { colors, spacing, textStyles } from '../styles/sharedStyles';
import { supabase } from '../api/supabaseClient';

const ResetPasswordScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  // Function to validate and format the verification code
  const formatCode = (input) => {
    // Remove any non-numeric characters and ensure 6 digits with leading zeros
    const numericOnly = input.replace(/[^0-9]/g, '').slice(0, 6);
    return numericOnly.padStart(6, '0');
  };

  const handleCodeChange = (text) => {
    const formattedCode = formatCode(text);
    setCode(formattedCode);
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setResending(true);
      setCode(''); // Clear any existing code
      console.log('Requesting new code for email:', email.trim());
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/send-password-reset-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      let responseData;
      const responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        responseData = { error: 'Invalid server response' };
      }

      console.log('Send code response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to send reset code');
      }

      Alert.alert(
        'Success', 
        'A new verification code has been sent to your email. Please check your inbox and spam folder.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error resending code:', error);
      Alert.alert('Error', error.message);
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !code || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Format code to match backend expectations
      const formattedCode = formatCode(code);
      
      console.log('Debug - Sending reset request with code:', {
        email: email.trim(),
        code: formattedCode,
        codeLength: formattedCode.length
      });

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/verify-code-and-update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          code: formattedCode,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      console.log('Debug - Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please login with your new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Debug - Reset password error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.title}>Reset Your Password</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!route.params?.email}
          />

          <TextInput
            style={styles.input}
            placeholder="6-Digit Verification Code"
            placeholderTextColor={colors.textSecondary}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleResetPassword} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.resendButton]} 
            onPress={handleResendCode}
            disabled={resending}
          >
            <Text style={[styles.buttonText, styles.resendButtonText]}>
              {resending ? 'Sending...' : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    ...textStyles.title,
    color: colors.primary,
    marginBottom: spacing.lg,
    fontSize: 24,
    textAlign: 'center',
  },
  input: {
    width: 300,
    height: 50,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    width: 300,
  },
  buttonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.md,
    marginBottom: 0,
  },
  resendButtonText: {
    color: colors.primary,
  },
});

export default ResetPasswordScreen;