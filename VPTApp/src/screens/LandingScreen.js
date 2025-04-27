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

const InputField = ({ icon, isPassword, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Icon name={icon} size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
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
            color="rgba(255, 255, 255, 0.6)" 
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

  // Clear all input fields when component mounts
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setHasAcceptedTerms(false);
    setCanAcceptTerms(false);
  }, []);

  // Reset all input fields when switching between login/signup
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setHasAcceptedTerms(false);
    setCanAcceptTerms(false);
  }, [isLogin]);

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      if (isLogin) {
        // Check if input is email or username
        const isEmail = email.includes('@');
        let authData;

        if (isEmail) {
          // Login with email
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });
          authData = { data, error };
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
          const { data, error } = await supabase.auth.signInWithPassword({
            email: profileData.email,
            password: password.trim(),
          });
          authData = { data, error };
        }
        
        if (authData.error) {
          Alert.alert('Login Error', authData.error.message);
          return;
        }
        
        if (authData.data?.user) {
          console.log('User logged in:', authData.data.user.id);
          navigation.navigate('Profile');
        }
      } else {
        if (!name.trim()) {
          Alert.alert('Error', 'Please enter your name');
          return;
        }
        if (!username.trim()) {
          Alert.alert('Error', 'Please enter a username');
          return;
        }
        if (!email.trim()) {
          Alert.alert('Error', 'Please enter your email');
          return;
        }
        if (!password.trim()) {
          Alert.alert('Error', 'Please enter your password');
          return;
        }
        if (password.trim().length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters long');
          return;
        }
        if (!hasAcceptedTerms && !isLogin) {
          Alert.alert('Error', 'Please accept the terms and conditions');
          return;
        }

        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
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
        
        if (error) {
          Alert.alert('Signup Error', error.message);
          return;
        }
        
        if (data?.user) {
          // Insert into userProfile
          const { error: profileError } = await supabase
            .from('userProfile')
            .insert({
              user_id: data.user.id,
              email: email.trim(),
              name: name.trim(),
              username: username.trim(),
              terms_accepted_at: true,
              is_admin: false
            });

          if (profileError) {
            Alert.alert('Profile Error', profileError.message);
            // Clear fields on error
            setEmail('');
            setPassword('');
            setName('');
            setUsername('');
            setHasAcceptedTerms(false);
            setCanAcceptTerms(false);
            return;
          }

          Alert.alert(
            'Success',
            'Account created! Please check your email for the verification link.'
          );
          // Clear all fields after successful signup
          setEmail('');
          setPassword('');
          setName('');
          setUsername('');
          setHasAcceptedTerms(false);
          setCanAcceptTerms(false);
          setIsLogin(true);
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!userError && user) {
        navigation.navigate('Profile');
      }
    } else {
      // For signup, continue with the signup flow
      handleSubmit();
    }
  };

  return (
    <SafeAreaView style={[layoutStyles.container]} edges={['top']}>
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
                    source={require('../../assets/vpt-logo.png')}
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
                      {hasAcceptedTerms && <Icon name="checkmark" size={16} color="white" />}
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
                    color={colors.primary} 
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
                    color={colors.card} 
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
                      color={colors.card} 
                      style={styles.forgotPasswordIcon}
                    />
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>

            {/* Decorative Footer */}
            {isLogin ? (
              <View style={styles.footerContainer}>
                <View style={styles.footerIconRow}>
                  <View style={styles.footerIconWrapper}>
                    <Icon name="barbell-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.footerIconWrapper}>
                    <Icon name="bicycle-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.footerIconWrapper}>
                    <Icon name="fitness-outline" size={20} color={colors.primary} />
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
                    <Icon name="barbell-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.footerIconWrapper}>
                    <Icon name="bicycle-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.footerIconWrapper}>
                    <Icon name="fitness-outline" size={20} color={colors.primary} />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        <DisclaimerModal
          visible={showDisclaimer}
          onAccept={() => {
            setShowDisclaimer(false);
            setCanAcceptTerms(true);
          }}
          onClose={() => setShowDisclaimer(false)}
        />
      </View>
    </SafeAreaView>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 20,
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
    fontSize: 32,
  },
  subtitle: {
    color: colors.card,
    textAlign: 'center',
    opacity: 0.8,
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
  passwordToggle: {
    padding: 8,
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
    color: colors.card,
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
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  termsText: {
    color: colors.card,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.card,
    marginRight: 8,
  },
  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  motivationContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  motivationDivider: {
    width: 40,
    height: 2,
    backgroundColor: `${colors.primary}30`,
    marginVertical: 8,
  },
  motivationSubtext: {
    fontSize: 12,
    color: colors.primary,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 0,
  },
});

export default LandingScreen; 