import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
} from 'react-native';
import { colors, spacing, textStyles, iconContainerStyles, layoutStyles } from '../styles/sharedStyles';
import { supabase } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const InputField = ({ icon, ...props }) => (
  <View style={styles.inputContainer}>
    <Icon name={icon} size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholderTextColor="rgba(255, 255, 255, 0.6)"
      {...props}
    />
  </View>
);

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
      <SafeAreaView style={[layoutStyles.container]} edges={['top']}>
        <View style={styles.background}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.content}>
              <LinearGradient
                colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.welcomeCard}
              >
                <View style={styles.headerContainer}>
                  <View style={styles.logoContainer}>
                    <Image 
                      source={require('../../assets/VPT-logo-csumb-1.png')}
                      style={styles.logo}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={[textStyles.title, styles.title]}>Reset Password</Text>
                  <Text style={[textStyles.subtitle, styles.subtitle]}>
                    Enter your verification code and new password
                  </Text>
                </View>

                <View style={styles.formContainer}>
                  <InputField
                    icon="mail-outline"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!route.params?.email}
                  />

                  <InputField
                    icon="key-outline"
                    placeholder="6-Digit Verification Code"
                    value={code}
                    onChangeText={handleCodeChange}
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  <InputField
                    icon="lock-closed-outline"
                    placeholder="New Password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />

                  <InputField
                    icon="lock-closed-outline"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />

                  <TouchableOpacity 
                    style={[styles.submitButton]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    <Icon 
                      name={loading ? "reload-outline" : "key-outline"} 
                      size={20} 
                      color={colors.primary} 
                      style={styles.submitIcon}
                    />
                    <Text style={styles.submitButtonText}>
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                  >
                    <Icon 
                      name="arrow-back-outline" 
                      size={16} 
                      color={colors.card} 
                      style={styles.backIcon}
                    />
                    <Text style={styles.backButtonText}>
                      Back to Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Decorative Footer */}
              <View style={styles.footerContainer}>
                <View style={styles.footerIconRow}>
                  <View style={iconContainerStyles.circularLarge}>
                    <Icon name="barbell-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={iconContainerStyles.circularLarge}>
                    <Icon name="bicycle-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={iconContainerStyles.circularLarge}>
                    <Icon name="fitness-outline" size={24} color={colors.primary} />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.card,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: colors.card,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.card,
    textAlign: 'center',
    opacity: 0.8,
    fontSize: 14,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.card,
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    backgroundColor: colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  backIcon: {
    marginRight: 8,
    opacity: 0.8,
  },
  backButtonText: {
    color: colors.card,
    fontSize: 14,
  },
  footerContainer: {
    width: '100%',
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  footerIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
});

export default ResetPasswordScreen; 