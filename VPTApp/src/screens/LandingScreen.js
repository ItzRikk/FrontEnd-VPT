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
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        
        if (error) {
          Alert.alert('Login Error', error.message);
          return;
        }
        
        if (data?.user) {
          console.log('User logged in:', data.user.id);
          
          // Check if user has already accepted terms
          const { data: profileData, error: profileError } = await supabase
            .from('userProfile')
            .select('terms_accepted_at')
            .eq('user_id', data.user.id)
            .single();

          if (profileError) {
            console.error('Error checking terms acceptance:', profileError);
          }

          // If terms not accepted yet, show disclaimer
          if (!profileData?.terms_accepted_at && !hasAcceptedTerms) {
            setShowDisclaimer(true);
            return;
          }

          // Update terms acceptance if they just accepted
          if (hasAcceptedTerms) {
            const { error: termsError } = await supabase
              .from('userProfile')
              .update({ terms_accepted_at: true })
              .eq('user_id', data.user.id);

            if (termsError) {
              console.error('Error updating terms acceptance:', termsError);
            }
          }

          // Continue with login flow
          const { data: questionnaireData, error: questionnaireError } = await supabase
            .from('questionnaire_answers')
            .select('experience_level')
            .eq('user_id', data.user.id)
            .single();

          if (!questionnaireError && questionnaireData) {
            const { error: updateError } = await supabase.auth.updateUser({
              data: {
                experience_level: questionnaireData.experience_level
              }
            });
            if (updateError) {
              console.error('Update user metadata error:', updateError);
            }
          }

          navigation.navigate('Profile');
        }
      } else {
        if (!name.trim()) {
          Alert.alert('Error', 'Please enter your name');
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
        if (!hasAcceptedTerms) {
          Alert.alert('Error', 'Please accept the terms and conditions');
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim(),
            },
          },
        });
        
        if (error) {
          Alert.alert('Signup Error', error.message);
          return;
        }
        
        if (data?.user) {
          // Create user profile with terms acceptance
          const { error: profileError } = await supabase
            .from('userProfile')
            .insert({
              user_id: data.user.id,
              terms_accepted_at: true
            });

          if (profileError) {
            console.error('Error creating user profile:', profileError);
          }

          Alert.alert('Success', 'Please check your email for verification link');
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error('Login/Signup error:', error);
      Alert.alert('Error', error.message);
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
        const { error: termsError } = await supabase
          .from('userProfile')
          .update({ terms_accepted_at: true })
          .eq('user_id', user.id);

        if (termsError) {
          console.error('Error updating terms acceptance:', termsError);
        }
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

                <InputField
                  icon="mail-outline"
                  placeholder="Email"
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

                <TouchableOpacity
                  style={styles.termsButton}
                  onPress={() => setShowDisclaimer(true)}
                >
                  <Icon 
                    name="document-text-outline" 
                    size={16} 
                    color={colors.card} 
                    style={styles.termsIcon}
                  />
                  <Text style={styles.termsText}>
                    Terms & Conditions
                  </Text>
                </TouchableOpacity>

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
        <DisclaimerModal
          visible={showDisclaimer}
          onAccept={handleDisclaimerAccept}
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
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  termsIcon: {
    marginRight: 8,
  },
  termsText: {
    color: colors.card,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LandingScreen; 