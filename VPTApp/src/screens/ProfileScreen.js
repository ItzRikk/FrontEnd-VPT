import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, textStyles, layoutStyles, spacing } from '../styles/sharedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Header from '../components/Header';

const themeColors = {
  darkNavy: '#0E1E32',
  darkNavyLight: '#162C4A',
  darkNavyMedium: '#112338',
  goldAccent: '#D49B45',
  goldLight: '#E8B76D',
  goldDark: '#B37F2E',
  lightBlue: '#A4D4E4',
  lightBlueDark: '#7BA8B8',
  white: '#FFFFFF',
  offWhite: 'rgba(255, 255, 255, 0.9)',
  transparent: 'transparent',
};

const ActionCard = ({ icon, label, onPress, color = themeColors.goldAccent }) => {
  const { width } = useWindowDimensions();
  // Calculate card width based on screen size
  const cardWidth = width < 350 ? (width - 48) / 2 : (width < 600 ? (width - 56) / 2 : 160);
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.actionCardContainer, { width: cardWidth }]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[themeColors.darkNavyMedium, themeColors.darkNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionCard}
      >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color={themeColors.darkNavy} style={styles.icon} />
        </View>
        <Text style={styles.actionLabel} numberOfLines={2}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const StatCard = ({ icon, label, value, description }) => (
  <View style={styles.statCardContainer}>
    <LinearGradient
      colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statCard}
    >
      <View style={styles.statHeader}>
        <View style={styles.statIconContainer}>
          <Icon name={icon} size={20} color={themeColors.goldAccent} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value || 'N/A'}</Text>
      {description && (
        <Text style={styles.statDescription} numberOfLines={2}>
          {description}
        </Text>
      )}
    </LinearGradient>
  </View>
);

const ProfileHeader = ({ name, avatarUrl }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 350;

  return (
    <View style={styles.profileHeaderContainer}>
      <LinearGradient
        colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHeader}
      >
        <View style={[styles.avatarContainer, isSmallScreen && { width: 60, height: 60 }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={[styles.avatar, isSmallScreen && { width: 50, height: 50 }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, isSmallScreen && { width: 50, height: 50, borderRadius: 25 }]}>
              <LinearGradient
                colors={[themeColors.goldLight, themeColors.goldAccent]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={[styles.avatarInitial, isSmallScreen && { fontSize: 20 }]}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[styles.avatarBorder, isSmallScreen && { width: 58, height: 58, borderRadius: 29 }]} />
        </View>

        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, isSmallScreen && { fontSize: 18 }]}>{name}</Text>
          <View style={styles.profileBadge}>
            <Icon name="fitness" size={14} color={themeColors.darkNavy} style={{ marginRight: 4 }} />
            <Text style={styles.profileBadgeText}>VPT Member</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const DetailCard = ({ user, profile, experienceLevel }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.accountDetailCard}>
      <LinearGradient
        colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.accountDetailContent}
      >
        <View style={styles.detailRow}>
          <Icon name="mail-outline" size={18} color={themeColors.lightBlue} />
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={[styles.detailValue, width < 350 && { fontSize: 12 }]} numberOfLines={1}>
            {profile?.email || user?.email}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Icon name="person-outline" size={18} color={themeColors.lightBlue} />
          <Text style={styles.detailLabel}>Name</Text>
          <Text style={[styles.detailValue, width < 350 && { fontSize: 12 }]} numberOfLines={1}>
            {profile?.name || 'Anonymous User'}
          </Text>
        </View>
        {experienceLevel?.level && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Icon name="fitness-outline" size={18} color={themeColors.lightBlue} />
              <Text style={styles.detailLabel}>Level</Text>
              <Text style={[styles.detailValue, width < 350 && { fontSize: 12 }]} numberOfLines={1}>
                {experienceLevel.level}
              </Text>
            </View>
          </>
        )}
      </LinearGradient>
    </View>
  );
};

const ProfileScreen = ({ route, navigation }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        
        // First check if we have a session
        const session2 = supabase.auth.session();
        
        if (!session2) {
          console.log('No session found, redirecting to login');
          navigation.navigate('Landing');
          return;
        }
        
        // Get current user from the session
        const user = session2.user;
        
        if (user) {
          setUser(user);

          // Fetch userProfile for name
          const { data: profileData, error: profileError } = await supabase
            .from('userProfile')
            .select('name, username, email')
            .eq('user_id', user.id)
            .single();
          if (profileData) {
            setProfile(profileData);
          } else {
            setProfile(null);
          }
          
          // Check if user has completed questionnaire
          const { data: questionnaireData, error: questionnaireError } = await supabase
            .from('questionnaire_answers')
            .select('experience_level')
            .eq('user_id', user.id)
            .single();

          // If no questionnaire data found and user is new (check created_at from userProfile)
          if (!questionnaireData) {
            const { data: profileData } = await supabase
              .from('userProfile')
              .select('created_at')
              .eq('user_id', user.id)
              .single();

            // If profile was created in the last 5 minutes, consider them a new user
            if (profileData) {
              const createdAt = new Date(profileData.created_at);
              const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
              
              if (createdAt > fiveMinutesAgo) {
                // New user, redirect to questionnaire
                navigation.navigate('Questionnaire');
                return;
              }
            }
          }

          // Set experience level if exists
          if (!questionnaireError && questionnaireData) {
            const description = getExperienceDescription(questionnaireData.experience_level);
            setExperienceLevel({
              level: questionnaireData.experience_level,
              description: description
            });
          } else if (user.user_metadata?.experience_level) {
            const description = getExperienceDescription(user.user_metadata.experience_level);
            setExperienceLevel({
              level: user.user_metadata.experience_level,
              description: description
            });
          }
        }
      } catch (error) {
        console.error('Error getting profile:', error);
        navigation.navigate('Landing');
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (route.params?.questionnaireResults) {
      const { experienceLevel } = route.params.questionnaireResults;
      setExperienceLevel({
        level: experienceLevel.level,
        description: getExperienceDescription(experienceLevel.level)
      });
    }
  }, [route.params?.questionnaireResults]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigation.navigate('Landing');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getExperienceDescription = (level) => {
    switch (level) {
      case 'Novice':
        return 'You are at the beginning of your weight lifting journey';
      case 'Intermediate':
        return 'You have some experience with weight lifting';
      case 'Advanced':
        return 'You have significant experience with weight lifting';
      default:
        return 'Complete the questionnaire to set your experience level';
    }
  };

  if (loading) {
    return (
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: themeColors.darkNavy, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
        }}
      >
        <LinearGradient
          colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <ActivityIndicator size="large" color={themeColors.goldAccent} />
        <Text style={{ color: themeColors.lightBlue, marginTop: 16, fontSize: 16 }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const fullName = profile?.name || 'Anonymous User';
  const padding = {
    paddingLeft: Math.max(16, insets.left),
    paddingRight: Math.max(16, insets.right),
  };

  return (
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
      
      <Header title="Profile" showBack={false} showSettings={true} />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.innerContainer, padding]}>
          <ProfileHeader name={fullName} />
          
          {experienceLevel?.level && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, width < 350 && { fontSize: 16 }]}>Experience</Text>
              <StatCard 
                icon="fitness-outline"
                label="Experience Level"
                value={experienceLevel.level}
                description={experienceLevel.description}
              />
            </View>
          )}
          
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, width < 350 && { fontSize: 16 }]}>Account Details</Text>
            <DetailCard user={user} profile={profile} experienceLevel={experienceLevel} />
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, width < 350 && { fontSize: 16 }]}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <ActionCard
                icon="fitness"
                label="Update Experience"
                onPress={() => navigation.navigate('Questionnaire')}
                color={themeColors.goldAccent}
              />
              <ActionCard
                icon="barbell-outline"
                label="Get Started"
                onPress={() => navigation.navigate('WorkoutEquipment')}
                color={themeColors.goldAccent}
              />
              <ActionCard
                icon="stats-chart"
                label="Progress"
                onPress={() => navigation.navigate('Progress')}
                color={themeColors.goldAccent}
              />
              <ActionCard
                icon="log-out-outline"
                label="Sign Out"
                onPress={handleSignOut}
                color={themeColors.goldAccent}
              />
            </View>
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.footerIconRow}>
              <View style={styles.footerIconWrapper}>
                <Icon name="barbell-outline" size={22} color={themeColors.goldAccent} />
              </View>
              <View style={styles.footerIconWrapper}>
                <Icon name="bicycle-outline" size={22} color={themeColors.goldAccent} />
              </View>
              <View style={styles.footerIconWrapper}>
                <Icon name="fitness-outline" size={22} color={themeColors.goldAccent} />
              </View>
            </View>
            <View style={styles.motivationContainer}>
              <Text style={[styles.motivationText, width < 350 && { fontSize: 14 }]}>
                "Transform your fitness journey with VPT"
              </Text>
              <View style={styles.motivationDivider} />
              <Text style={[styles.motivationSubtext, width < 350 && { fontSize: 12 }]}>
                Personalized workouts. Expert guidance. Real results.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
  },
  innerContainer: {
    paddingHorizontal: 16,
  },
  profileHeaderContainer: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
    borderRadius: 16,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarBorder: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: themeColors.goldAccent,
    borderStyle: 'dashed',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: themeColors.darkNavy,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.white,
    marginBottom: 4,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.goldAccent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: themeColors.darkNavy,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.white,
    marginBottom: 12,
  },
  statCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 155, 69, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.lightBlue,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: themeColors.white,
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 14,
    color: themeColors.white,
    opacity: 0.8,
  },
  accountDetailCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountDetailContent: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.lightBlue,
    marginLeft: 8,
    width: 60,
  },
  detailValue: {
    fontSize: 14,
    color: themeColors.white,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(164, 212, 228, 0.1)',
    marginHorizontal: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCardContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginLeft: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.white,
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 24,
  },
  footerIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  footerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 155, 69, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 155, 69, 0.2)',
  },
  motivationContainer: {
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.goldAccent,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  motivationDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(164, 212, 228, 0.2)',
    marginVertical: 10,
  },
  motivationSubtext: {
    fontSize: 14,
    color: themeColors.goldAccent,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default ProfileScreen;