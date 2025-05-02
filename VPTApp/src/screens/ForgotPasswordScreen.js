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
    <Icon name={icon} size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
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
              colors={[colors.primary, '#FF9500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeCard}
            >
              <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../assets/VPT-logo.png')}
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
                  style={[styles.submitButton]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <Icon 
                    name={loading ? "reload-outline" : "paper-plane-outline"} 
                    size={20} 
                    color={colors.primary} 
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
                <View style={styles.footerIconWrapper}>
                  <Icon name="barbell-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.footerIconWrapper}>
                  <Icon name="bicycle-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.footerIconWrapper}>
                  <Icon name="fitness-outline" size={24} color={colors.primary} />
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
    color: 'rgba(255, 255, 255, 0.6)',
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
  footerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  motivationContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  motivationDivider: {
    width: 40,
    height: 2,
    backgroundColor: `${colors.primary}30`,
    marginVertical: 8,
  },
  motivationSubtext: {
    fontSize: 14,
    color: colors.primary,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen; 