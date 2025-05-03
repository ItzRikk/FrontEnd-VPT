import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, textStyles, buttonStyles, inputStyles, layoutStyles } from '../styles/sharedStyles';
import { supabase } from '../api/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import DisclaimerModal from '../components/DisclaimerModal';
import { useFocusEffect } from '@react-navigation/native';

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

const InputField = ({ icon, isPassword, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <View style={styles.inputContainer}>
      <Icon name={icon} size={20} color={themeColors.lightBlue} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        secureTextEntry={isPassword && !showPassword}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          style={styles.passwordToggle}
        >
          <Icon 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color={themeColors.lightBlue} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const LandingScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [canAcceptTerms, setCanAcceptTerms] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Clear all input fields when component mounts
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setHasAcceptedTerms(false);
    setCanAcceptTerms(false);
  }, []);

  // Clear all input fields every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setName('');
      setUsername('');
      setHasAcceptedTerms(false);
      setCanAcceptTerms(false);
    }, [])
  );

  // Reset all input fields when switching between login/signup
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setHasAcceptedTerms(false);
    setCanAcceptTerms(false);
  }, [isLogin]);

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signIn({
        email: verificationEmail,
        password: password,
      });
      
      if (error) {
        Alert.alert('Error', 'Failed to resend verification email. Please try again later.');
        return;
      }
      
      Alert.alert(
        'Success',
        'Verification email has been resent. Please check your inbox and spam folder.'
      );
    } catch (error) {
      console.error('Error resending verification:', error);
      Alert.alert('Error', 'Failed to resend verification email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    try {
      setLoading(true);
      if (isLogin) {
        // Check if input is email or username
        const isEmail = email.includes('@');
        let authData;
        let loginEmail = email.trim();
        let loginName = name.trim();
        let loginUsername = username.trim();
        
        if (isEmail) {
          // Login with email
          const { user, error } = await supabase.auth.signIn({
            email: email.trim(),
            password: password.trim(),
          });
          authData = { user, error };
        } else {
          // Login with username
          // First get the user's email from the userProfile table
          const { data: profileData, error: profileError } = await supabase
            .from('userProfile')
            .select('email')
            .eq('username', email.trim())
            .single();
            
          if (profileError || !profileData) {
            Alert.alert('Login Error', 'Invalid username or password');
            return;
          }
          
          // Then sign in with the email
          const { user, error } = await supabase.auth.signIn({
            email: profileData.email,
            password: password.trim(),
          });
          authData = { user, error };
          loginEmail = profileData.email;
        }
        
        if (authData.error) {
          Alert.alert('Login Error', authData.error.message);
          return;
        }
        
        if (authData.user) {
          // Hide verification card after successful login
          setShowVerificationMessage(false);
          setVerificationEmail('');
          const userId = authData.user.id;
          // Only one check for questionnaire completion
          const { data: questionnaireData, error: questionnaireError } = await supabase
            .from('questionnaire_answers')
            .select('id')
            .eq('user_id', userId)
            .single();
          if (!questionnaireData) {
            // No questionnaire found, redirect to onboarding
            navigation.navigate('Questionnaire');
          } else {
            // Questionnaire completed, go to profile
            navigation.navigate('Profile');
          }
        }
      } else {
        console.log('Starting signup process...');
        
        if (!name.trim()) {
          console.log('Name validation failed');
          Alert.alert('Error', 'Please enter your name');
          return;
        }
        if (!username.trim()) {
          console.log('Username validation failed');
          Alert.alert('Error', 'Please enter a username');
          return;
        }
        if (!email.trim()) {
          console.log('Email validation failed');
          Alert.alert('Error', 'Please enter your email');
          return;
        }
        if (!password.trim()) {
          console.log('Password validation failed');
          Alert.alert('Error', 'Please enter your password');
          return;
        }
        if (password.trim().length < 6) {
          console.log('Password length validation failed');
          Alert.alert('Error', 'Password must be at least 6 characters long');
          return;
        }
        if (!hasAcceptedTerms && !isLogin) {
          console.log('Terms acceptance validation failed');
          Alert.alert('Error', 'Please accept the terms and conditions');
          return;
        }

        console.log('Checking if email exists in userProfile...');
        // First check if email exists in userProfile
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('userProfile')
          .select('user_id')
          .eq('email', email.trim())
          .single();

        console.log('Profile check result:', { existingProfile, profileCheckError });

        // Only show error if it's not a "no rows returned" error
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error('Profile check error:', profileCheckError);
          Alert.alert('Error', 'Failed to check email availability. Please try again.');
          return;
        }

        // If profile exists, we can't use this email
        if (existingProfile) {
          console.log('Email already exists in userProfile');
          Alert.alert(
            'Email Already Registered',
            'This email is already registered. Please sign in or use a different email.',
            [
              { text: 'Sign In', onPress: () => setIsLogin(true) },
              { text: 'OK', style: 'cancel' }
            ]
          );
          return;
        }

        console.log('Attempting to create auth user...');
        // Create user in Supabase Auth
        const { user, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim(),
              username: username.trim(),
            },
            emailRedirectTo: 'vpt://auth/callback'
          }
        });
        
        console.log('Auth signup result:', { user, error });
        
        if (error) {
          if (error.message.includes('already registered')) {
            console.log('Email exists in auth.users, attempting cleanup...');
            // If the email exists in auth.users but not in userProfile,
            // we need to clean up the auth user first
            try {
              // Try to sign in to get the user ID
              const { user: signInUser, error: signInError } = await supabase.auth.signIn({
                email: email.trim(),
                password: password.trim(),
              });

              console.log('Sign in result:', { signInUser, signInError });

              if (signInError) {
                console.error('Sign in error:', signInError);
                Alert.alert(
                  'Email Already Registered',
                  'This email is already registered but in an invalid state. Please contact support.',
                  [
                    { text: 'OK', style: 'cancel' }
                  ]
                );
                return;
              }

              console.log('Attempting to delete orphaned user...');
              // Delete the orphaned auth user
              const { error: deleteError } = await supabase.rpc('delete_user', {
                user_id: signInUser.id
              });

              console.log('Delete user result:', { deleteError });

              if (deleteError) {
                console.error('Delete user error:', deleteError);
                Alert.alert(
                  'Error',
                  'Failed to clean up existing account. Please contact support.',
                  [
                    { text: 'OK', style: 'cancel' }
                  ]
                );
                return;
              }

              console.log('Attempting second signup...');
              // Now try signup again
              const { user: newUser, error: newError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
                options: {
                  data: {
                    name: name.trim(),
                    username: username.trim(),
                  },
                  emailRedirectTo: 'vpt://auth/callback'
                }
              });

              console.log('Second signup result:', { newUser, newError });

              if (newError) {
                console.error('Second signup error:', newError);
                Alert.alert('Signup Error', newError.message);
                return;
              }

              // Try to create userProfile after second signup
              if (newUser) {
                try {
                  const { error: profileError } = await supabase
                    .from('userProfile')
                    .upsert({
                      user_id: newUser.id,
                      email: email.trim(),
                      name: name.trim(),
                      username: username.trim(),
                      terms_accepted_at: true,
                      is_admin: false
                    });
                  if (profileError) {
                    if (profileError.code === '23503') {
                      Alert.alert('Profile Error', 'Account created, but profile could not be created yet. Please try logging in again in a few seconds.');
                    } else {
                      Alert.alert('Profile Error', profileError.message);
                    }
                    return;
                  }
                } catch (profileCatchError) {
                  Alert.alert('Profile Error', 'Account created, but profile could not be created yet. Please try logging in again in a few seconds.');
                  return;
                }
                setVerificationEmail(email.trim());
                setShowVerificationMessage(true);
                Alert.alert(
                  'Success',
                  'Account created! Please check your email for the verification link. If you don\'t see it, check your spam folder.',
                  [
                    { 
                      text: 'Resend Verification', 
                      onPress: handleResendVerification 
                    },
                    { 
                      text: 'OK', 
                      onPress: () => {
                        setEmail('');
                        setPassword('');
                        setName('');
                        setUsername('');
                        setHasAcceptedTerms(false);
                        setCanAcceptTerms(false);
                        setIsLogin(true);
                      }
                    }
                  ]
                );
                return;
              }
            } catch (cleanupError) {
              console.error('Error cleaning up orphaned user:', cleanupError);
              Alert.alert(
                'Error',
                'Failed to clean up existing account. Please contact support.',
                [
                  { text: 'OK', style: 'cancel' }
                ]
              );
              return;
            }
          } else {
            console.error('Signup error:', error);
            Alert.alert('Signup Error', error.message);
            return;
          }
        }
        
        if (user) {
          // Immediately create userProfile after signup
          try {
            const { error: profileError } = await supabase
              .from('userProfile')
              .upsert({
                user_id: user.id,
                email: email.trim(),
                name: name.trim(),
                username: username.trim(),
                terms_accepted_at: true,
                is_admin: false
              });
            if (profileError) {
              if (profileError.code === '23503') {
                Alert.alert('Profile Error', 'Account created, but profile could not be created yet. Please try logging in again in a few seconds.');
              } else {
                Alert.alert('Profile Error', profileError.message);
              }
              return;
            }
          } catch (profileCatchError) {
            Alert.alert('Profile Error', 'Account created, but profile could not be created yet. Please try logging in again in a few seconds.');
            return;
          }
          setVerificationEmail(email.trim());
          setShowVerificationMessage(true);
          Alert.alert(
            'Success',
            'Account created! Please check your email for the verification link. If you don\'t see it, check your spam folder.',
            [
              { 
                text: 'Resend Verification', 
                onPress: handleResendVerification 
              },
              { 
                text: 'OK', 
                onPress: () => {
                  setEmail('');
                  setPassword('');
                  setName('');
                  setUsername('');
                  setHasAcceptedTerms(false);
                  setCanAcceptTerms(false);
                  setIsLogin(true);
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Login/Signup error:', error);
      Alert.alert('Error', error.message);
      // Clear fields on error
      setEmail('');
      setPassword('');
      setName('');
      setUsername('');
      setHasAcceptedTerms(false);
      setCanAcceptTerms(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisclaimerAccept = async () => {
    setHasAcceptedTerms(true);
    setShowDisclaimer(false);
    
    // For login, we need to update the database and then navigate
    if (isLogin) {
      const session = supabase.auth.session();
      const user = session ? session.user : null;
      if (user) {
        navigation.navigate('Profile');
      }
    } else {
      // For signup, continue with the signup flow
      handleSubmit();
    }
  };

  return (
    <SafeAreaView style={[layoutStyles.container, { backgroundColor: themeColors.darkNavy }]} edges={[]}>
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
                <Text style={[textStyles.title, styles.title]}>Welcome</Text>
                <Text style={[textStyles.subtitle, styles.subtitle]}>
                  {isLogin ? 'Sign in to continue' : 'Create your account'}
                </Text>
              </View>
              <View style={styles.formContainer}>
                {!isLogin && (
                  <InputField
                    icon="person-outline"
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                )}
                {!isLogin && (
                  <InputField
                    icon="at-outline"
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoComplete="username"
                  />
                )}
                <InputField
                  icon="mail-outline"
                  placeholder="Email or Username"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <InputField
                  icon="lock-closed-outline"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password"
                  isPassword
                />
                {/* Terms acceptance for signup only, directly under password */}
                {!isLogin && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        hasAcceptedTerms && styles.checked,
                        !canAcceptTerms && { opacity: 0.5 }
                      ]}
                      onPress={() => canAcceptTerms && setHasAcceptedTerms(!hasAcceptedTerms)}
                      disabled={!canAcceptTerms}
                    >
                      {hasAcceptedTerms && <Icon name="checkmark" size={16} color={themeColors.darkNavy} />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowDisclaimer(true)}>
                      <Text style={[styles.termsText, { textDecorationLine: 'none' }]}>Terms & Conditions</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Icon 
                    name={loading ? "reload-outline" : (isLogin ? "log-in-outline" : "person-add-outline")} 
                    size={20} 
                    color={themeColors.darkNavy} 
                    style={styles.submitIcon}
                  />
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => setIsLogin(!isLogin)}
                  disabled={loading}
                >
                  <Icon 
                    name={isLogin ? "person-add-outline" : "log-in-outline"} 
                    size={16} 
                    color={themeColors.white} 
                    style={styles.switchIcon}
                  />
                  <Text style={styles.switchButtonText}>
                    {isLogin
                      ? "Don't have an account? Sign Up"
                      : 'Already have an account? Sign In'}
                  </Text>
                </TouchableOpacity>
                {isLogin && (
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => navigation.navigate('ForgotPassword')}
                    disabled={loading}
                  >
                    <Icon 
                      name="key-outline" 
                      size={16} 
                      color={themeColors.lightBlue} 
                      style={styles.forgotPasswordIcon}
                    />
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}
                {showVerificationMessage && (
                  <View style={styles.verificationMessage}>
                    <Text style={styles.verificationText}>
                      Please check your email ({verificationEmail}) for the verification link.
                      If you don't see it, check your spam folder.
                    </Text>
                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResendVerification}
                      disabled={loading}
                    >
                      <Icon 
                        name="refresh-outline" 
                        size={16} 
                        color={themeColors.lightBlue} 
                        style={styles.resendIcon}
                      />
                      <Text style={styles.resendText}>
                        Resend Verification Email
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </LinearGradient>
            {/* Decorative Footer */}
            {isLogin ? (
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
            ) : (
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
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      <DisclaimerModal
        visible={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onClose={() => setShowDisclaimer(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: themeColors.darkNavy,
    marginBottom: 20,
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
    fontSize: 32,
  },
  subtitle: {
    color: themeColors.lightBlue,
    textAlign: 'center',
    opacity: 0.9,
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
  passwordToggle: {
    padding: 8,
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
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  switchIcon: {
    marginRight: 8,
    opacity: 0.8,
  },
  switchButtonText: {
    color: themeColors.white,
    fontSize: 14,
  },
  forgotPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  forgotPasswordIcon: {
    marginRight: 8,
    opacity: 0.8,
  },
  forgotPasswordText: {
    color: themeColors.lightBlue,
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
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  footerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${themeColors.darkNavy}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: `${themeColors.goldAccent}30`,
  },
  termsText: {
    color: themeColors.lightBlue,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: themeColors.lightBlue,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: themeColors.goldAccent,
    borderColor: themeColors.goldAccent,
  },
  motivationContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.goldAccent,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  motivationDivider: {
    width: 40,
    height: 2,
    backgroundColor: `${themeColors.lightBlue}30`,
    marginVertical: 8,
  },
  motivationSubtext: {
    fontSize: 12,
    color: themeColors.goldAccent,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 0,
  },
  verificationMessage: {
    backgroundColor: 'rgba(164, 212, 228, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.2)',
  },
  verificationText: {
    color: themeColors.lightBlue,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendIcon: {
    marginRight: 8,
  },
  resendText: {
    color: themeColors.lightBlue,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LandingScreen;