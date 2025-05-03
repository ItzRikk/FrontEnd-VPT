import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  SafeAreaView, 
  Text, 
  TouchableOpacity, 
  Alert, 
  TouchableWithoutFeedback, 
  Keyboard, 
  StyleSheet, 
  ScrollView,
  StatusBar,
  Platform,
  useWindowDimensions
} from 'react-native';
import { supabase } from '../api/supabaseClient';
import Header from '../components/Header';
import { colors, spacing, textStyles } from '../styles/sharedStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const themeColors = {
  darkNavy: '#0E1E32',
  darkNavyLight: '#162C4A',
  darkNavyMedium: '#112338',
  goldAccent: '#D49B45',
  goldLight: '#E8B76D',
  goldDark: '#B37F2E',
  lightBlue: '#A4D4E4',
  lightBlueLight: '#C4E4F4',
  lightBlueDark: '#7BA8B8',
  white: '#FFFFFF',
  offWhite: 'rgba(255, 255, 255, 0.9)',
  transparent: 'transparent',
  error: '#E53935',
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallScreen = width < 350;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const session = supabase.auth.session();
      const user = session ? session.user : null;
      if (user) {
        const { data, error } = await supabase
          .from('userProfile')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (data) {
          setUserData(data);
          setName(data.name || '');
          setUsername(data.username || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const session = supabase.auth.session();
      const user = session ? session.user : null;
      if (!user) {
        Alert.alert('Error', 'Could not get user');
        return;
      }
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

      if (error) {
        if (error.code === '23505' && error.message.includes('username')) {
          Alert.alert('Error', 'This username is already taken. Please choose another one.');
        } else {
          Alert.alert('Error', error.message);
        }
        return;
      }
      Alert.alert('Success', 'Profile updated successfully');
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (loading) return;
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
      setLoading(true);
      const session = supabase.auth.session();
      const user = session ? session.user : null;
      if (!user) {
        Alert.alert('Error', 'Could not get user');
        return;
      }
      // First verify current password
      const session2 = supabase.auth.session();
      const user2 = session2 ? session2.user : null;
      const { error: signInError } = await supabase.auth.signIn({
        email: user2.email,
        password: currentPassword,
      });
      if (signInError) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }
      // Update password
      const { error: updateError } = await supabase.auth.update({
        password: newPassword
      });
      if (updateError) throw updateError;
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const session = supabase.auth.session();
              const user = session ? session.user : null;
              if (!user) {
                Alert.alert('Error', 'Could not get user');
                return;
              }

              // First delete the user profile
              const { error: profileError } = await supabase
                .from('userProfile')
                .delete()
                .eq('user_id', user.id);

              if (profileError) throw profileError;

              // Then delete the auth user
              const { error: deleteError } = await supabase.rpc('delete_user', {
                user_id: user.id
              });

              if (deleteError) throw deleteError;

              // Then sign out the user
              const { error: signOutError } = await supabase.auth.signOut();
              
              if (signOutError) {
                console.error('Error signing out:', signOutError);
                // Even if sign out fails, we should still show the success message
                // since the account was deleted
              }

              Alert.alert(
                'Account Deleted',
                'Your account has been successfully deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to the login screen
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const padding = {
    paddingLeft: Math.max(16, insets.left),
    paddingRight: Math.max(16, insets.right),
  };

  const renderButton = (icon, label, onPress, color = themeColors.goldAccent, textColor = themeColors.darkNavy, isLoading = false) => (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: color }]} 
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <Text style={[styles.buttonText, { color: textColor }]}>Loading...</Text>
      ) : (
        <>
          <Icon name={icon} size={20} color={textColor} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: themeColors.darkNavy,
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
        }}
        edges={['left', 'right']}
      >
        <StatusBar barStyle="light-content" backgroundColor={themeColors.darkNavy} />
        <LinearGradient
          colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        <Header title="Settings" showBack={true} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, padding, { paddingBottom: insets.bottom + 20 }]} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionContainer}>
            <LinearGradient
              colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.section}
            >
              <View style={styles.sectionTitleContainer}>
                <Icon name="person-circle" size={20} color={themeColors.goldAccent} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, isSmallScreen && { fontSize: 18 }]}>Account Information</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Icon name="person-outline" size={20} color={themeColors.lightBlue} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Icon name="at-outline" size={20} color={themeColors.lightBlue} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                />
              </View>
              
              {renderButton(
                "save-outline", 
                "Update Profile", 
                handleUpdateProfile,
                themeColors.goldAccent,
                themeColors.darkNavy,
                loading
              )}
            </LinearGradient>
          </View>

          <View style={styles.sectionContainer}>
            <LinearGradient
              colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.section}
            >
              <View style={styles.sectionTitleContainer}>
                <Icon name="lock-closed" size={20} color={themeColors.lightBlue} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, isSmallScreen && { fontSize: 18 }]}>Change Password</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color={themeColors.lightBlue} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Icon 
                    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={themeColors.lightBlue} 
                    style={styles.inputIcon} 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Icon name="key-outline" size={20} color={themeColors.lightBlue} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Icon 
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={themeColors.lightBlue} 
                    style={styles.inputIcon} 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Icon name="checkmark-outline" size={20} color={themeColors.lightBlue} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={themeColors.lightBlue} 
                    style={styles.inputIcon} 
                  />
                </TouchableOpacity>
              </View>
              
              {renderButton(
                "lock-closed-outline", 
                "Update Password", 
                handleUpdatePassword,
                themeColors.lightBlue,
                themeColors.darkNavy,
                loading
              )}
            </LinearGradient>
          </View>

          <View style={styles.sectionContainer}>
            <LinearGradient
              colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.section, styles.deleteSection]}
            >
              <View style={styles.dangerZoneContainer}>
                <Text style={styles.dangerZoneText}>DANGER ZONE</Text>
                <View style={styles.dangerZoneDivider} />
              </View>
              
              {renderButton(
                "trash-outline", 
                "Delete Account", 
                handleDeleteAccount,
                themeColors.error,
                themeColors.white,
                loading
              )}
              
              <Text style={styles.deleteWarning}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 80,
    flexGrow: 1,
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.2)',
    height: 50,
  },
  input: {
    flex: 1,
    height: 50,
    color: themeColors.white,
    fontSize: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteSection: {
    padding: 20,
  },
  dangerZoneContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dangerZoneText: {
    color: themeColors.error,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 8,
  },
  dangerZoneDivider: {
    width: 60,
    height: 2,
    backgroundColor: themeColors.error,
    opacity: 0.5,
  },
  deleteWarning: {
    textAlign: 'center',
    marginTop: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontStyle: 'italic',
  },
});

export default SettingsScreen;