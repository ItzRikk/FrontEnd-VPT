import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, textStyles } from '../styles/sharedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../api/supabaseClient';

const { width, height } = Dimensions.get('window');

const themeColors = {
  darkNavy: '#0E1E32', // Dark navy blue background
  goldAccent: '#D49B45', // Gold/orange accent color
  lightBlue: '#A4D4E4', // Light blue for graphs/lines
  white: '#FFFFFF',
  offWhite: 'rgba(255, 255, 255, 0.8)',
  transparent: 'transparent',
};

const FrostedCard = ({ style, children, intensity = 60 }) => (
  <View style={[styles.frostedCardContainer, style]}>
    <BlurView
      intensity={intensity}
      tint="default"
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.frostedContent}>
      {children}
    </View>
  </View>
);

const InputField = ({ icon, ...props }) => (
  <View style={styles.inputContainer}>
    <Icon name={icon} size={20} color={themeColors.lightBlue} style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholderTextColor="rgba(255, 255, 255, 0.6)"
      {...props}
    />
  </View>
);

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (loading) return;

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://ifkmefcurfniuefcolgr.supabase.co/functions/v1/send-password-reset-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || supabase.supabaseKey}`
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to send reset code');
      }

      Alert.alert(
        'Success',
        'A verification code has been sent to your email. Please check your inbox and use the code to reset your password.',
        [{ text: 'OK', onPress: () => navigation.navigate('ResetPassword', { email: email.trim() }) }]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.background}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.content}>
            <LinearGradient
              colors={[themeColors.darkNavy, '#0A1726']}
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
                  Enter your email to receive reset instructions
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
                  autoComplete="email"
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <Icon 
                    name={loading ? "reload-outline" : "paper-plane-outline"} 
                    size={20} 
                    color={themeColors.darkNavy} 
                    style={styles.submitIcon}
                  />
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Sending...' : 'Send Reset Instructions'}
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
                    color={themeColors.white} 
                    style={styles.backIcon}
                  />
                  <Text style={styles.backButtonText}>
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.footerContainer}>
              <View style={styles.footerIconRow}>
                <View style={styles.footerIconWrapper}>
                  <Icon name="barbell-outline" size={20} color={themeColors.goldAccent} />
                </View>
                <View style={styles.footerIconWrapper}>
                  <Icon name="bicycle-outline" size={20} color={themeColors.goldAccent} />
                </View>
                <View style={styles.footerIconWrapper}>
                  <Icon name="fitness-outline" size={20} color={themeColors.goldAccent} />
                </View>
              </View>
              <View style={styles.motivationContainer}>
                <Text style={styles.motivationText}>
                  "Transform your fitness journey with VPT"
                </Text>
                <View style={styles.motivationDivider} />
                <Text style={styles.motivationSubtext}>
                  Personalized workouts. Expert guidance. Real results.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: themeColors.darkNavy,
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
    borderColor: themeColors.lightBlue,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: themeColors.darkNavy,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: themeColors.goldAccent,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: themeColors.white,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    color: themeColors.lightBlue,
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.2)', // Lighter version of lightBlue
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: themeColors.white,
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    backgroundColor: themeColors.goldAccent,
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
    color: themeColors.darkNavy,
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
    color: themeColors.white,
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
  footerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themeColors.darkNavy,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: `${themeColors.goldAccent}30`,
  },
  motivationContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.goldAccent,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  motivationDivider: {
    width: 40,
    height: 2,
    backgroundColor: `${themeColors.lightBlue}30`,
    marginVertical: 8,
  },
  motivationSubtext: {
    fontSize: 14,
    color: themeColors.goldAccent,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;