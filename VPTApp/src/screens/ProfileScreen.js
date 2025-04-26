import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, textStyles, layoutStyles, spacing } from '../styles/sharedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');
const CARD_MARGIN = spacing.xs;
const CARD_WIDTH = (width - spacing.md * 2 - CARD_MARGIN * 2) / 2;

const FrostedCard = ({ style, children, intensity = 25 }) => (
  <View style={[styles.frostedCardContainer, style]}>
    <BlurView
      intensity={intensity}
      tint="light"
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.frostedContent}>
      {children}
    </View>
  </View>
);

const ActionCard = ({ icon, label, onPress, color = colors.primary }) => (
  <TouchableOpacity onPress={onPress} style={styles.actionCardContainer}>
    <View style={[styles.actionCard]}>
      <LinearGradient
        colors={[`${colors.primary}10`, `${colors.primary}05`]}
        style={StyleSheet.absoluteFill}
      />
      <BlurView
        intensity={40}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color={colors.card} />
      </View>
      <Text style={styles.actionLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const ProfileScreen = ({ route, navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [experienceLevel, setExperienceLevel] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          navigation.navigate('Landing');
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to login');
          navigation.navigate('Landing');
          return;
        }
        
        // Get current user from the session
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          navigation.navigate('Landing');
          return;
        }
        
        if (user) {
          setUser(user);
          
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
        return 'Unable to determine experience level';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[layoutStyles.container, layoutStyles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'Anonymous';

  return (
    <SafeAreaView style={[layoutStyles.container]} edges={['top']}>
      <Header title="Profile" showBack={false} showSettings={true} />
      <View style={styles.content}>
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={[`${colors.primary}10`, `${colors.primary}05`]}
            style={StyleSheet.absoluteFill}
          />
          <BlurView
            intensity={40}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.welcomeHeader}>
            <View style={styles.userIconContainer}>
              <Icon name="person-circle-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[textStyles.title, styles.nameText]}>{firstName}</Text>
          </View>
          <View style={styles.experienceSection}>
            <View style={styles.experienceRow}>
              <View style={styles.experienceIconContainer}>
                <Icon name="fitness-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.experienceTextContainer}>
                <Text style={[textStyles.caption, styles.experienceLabel]}>Experience Level</Text>
                <Text style={[textStyles.subtitle, styles.experienceValue]}>
                  {experienceLevel?.level || 'N/A'}
                </Text>
                <Text style={[textStyles.caption, styles.experienceDescription]} numberOfLines={2}>
                  {experienceLevel?.description || 'Complete the questionnaire to set your experience level'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={[`${colors.primary}10`, `${colors.primary}05`]}
            style={StyleSheet.absoluteFill}
          />
          <BlurView
            intensity={40}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.sectionHeader}>
            <Icon name="information-circle-outline" size={24} color={colors.primary} />
            <Text style={[textStyles.subtitle, styles.sectionTitle]}>Account Details</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="mail-outline" size={20} color={colors.primary} />
            <Text style={[textStyles.caption, styles.detailText]}>{user?.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="fitness-outline" size={20} color={colors.primary} />
            <Text style={[textStyles.caption, styles.detailText]}>
              {experienceLevel?.level || 'Not set'}
            </Text>
          </View>
        </View>

        <View style={styles.actionGrid}>
          <ActionCard
            icon="fitness"
            label="Update Experience"
            onPress={() => navigation.navigate('Questionnaire')}
            color={colors.primary}
          />
          <ActionCard
            icon="barbell-outline"
            label="Get Started"
            onPress={() => navigation.navigate('WorkoutEquipment')}
            color={colors.primary}
          />
          <ActionCard
            icon="stats-chart"
            label="Progress"
            onPress={() => navigation.navigate('Progress')}
            color={colors.primary}
          />
          <ActionCard
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
            color={colors.primary}
          />
        </View>

        {/* Decorative Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerIconRow}>
            <View style={styles.footerIconWrapper}>
              <Icon name="barbell-outline" size={24} color={`${colors.primary}40`} />
            </View>
            <View style={styles.footerIconWrapper}>
              <Icon name="bicycle-outline" size={24} color={`${colors.primary}40`} />
            </View>
            <View style={styles.footerIconWrapper}>
              <Icon name="fitness-outline" size={24} color={`${colors.primary}40`} />
            </View>
          </View>
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>
              "Every rep brings you closer to your goals"
            </Text>
            <View style={styles.motivationDivider} />
            <Text style={styles.motivationSubtext}>
              Track your progress. Stay motivated. Achieve more.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: spacing.md,
  },
  cardWrapper: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  experienceSection: {
    padding: spacing.md,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  experienceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  experienceTextContainer: {
    flex: 1,
  },
  experienceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    color: '#000000',
  },
  experienceValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#000000',
  },
  experienceDescription: {
    fontSize: 14,
    opacity: 0.8,
    color: '#000000',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    marginLeft: spacing.sm,
    color: '#000000',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  detailText: {
    marginLeft: spacing.md,
    flex: 1,
    color: '#000000',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -CARD_MARGIN,
    paddingHorizontal: spacing.md,
  },
  actionCardContainer: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
  },
  actionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',
    height: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  actionLabel: {
    ...textStyles.subtitle,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    color: colors.text,
    zIndex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    color: '#000000',
  },
  footerContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: 'auto', // Pushes the footer to the bottom
  },
  footerIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  footerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  motivationContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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
    marginVertical: spacing.sm,
  },
  motivationSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ProfileScreen;