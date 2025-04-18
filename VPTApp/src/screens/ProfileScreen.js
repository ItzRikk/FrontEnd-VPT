import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, textStyles, layoutStyles, spacing } from '../styles/sharedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const CARD_MARGIN = spacing.xs;
const CARD_WIDTH = (width - spacing.md * 2 - CARD_MARGIN * 2) / 2;

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

const ActionCard = ({ icon, label, onPress, color = colors.primary }) => (
  <TouchableOpacity onPress={onPress} style={styles.actionCardContainer}>
    <FrostedCard style={styles.actionCard}>
      <View style={styles.actionContent}>
        <LinearGradient
          colors={[color, color]}
          style={styles.iconContainer}
        >
          <Icon name={icon} size={20} color={colors.card} />
        </LinearGradient>
        <Text style={[textStyles.caption, styles.actionLabel]} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </FrostedCard>
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
          
          // Fetch experience level from questionnaire_answers
          const { data: questionnaireData, error: questionnaireError } = await supabase
            .from('questionnaire_answers')
            .select('experience_level')
            .eq('user_id', user.id)
            .single();

          if (!questionnaireError && questionnaireData) {
            // Get description based on level
            const description = getExperienceDescription(questionnaireData.experience_level);
            setExperienceLevel({
              level: questionnaireData.experience_level,
              description: description
            });
          } else if (user.user_metadata?.experience_level) {
            // Fallback to user metadata if questionnaire data not found
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
      setExperienceLevel(route.params.questionnaireResults.experienceLevel);
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
      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={[colors.primary, '#FF9500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.welcomeHeader}>
            <Text style={[textStyles.subtitle, styles.welcomeText]}>Welcome back,</Text>
            <Text style={[textStyles.title, styles.nameText]}>{firstName}</Text>
          </View>
          <View style={styles.experienceSection}>
            <Text style={[textStyles.caption, styles.experienceLabel]}>Experience Level</Text>
            <Text style={[textStyles.subtitle, styles.experienceValue]}>
              {experienceLevel?.level || 'N/A'}
            </Text>
            <Text style={[textStyles.caption, styles.experienceDescription]} numberOfLines={2}>
              {experienceLevel?.description || 'Complete the questionnaire to set your experience level'}
            </Text>
          </View>
        </View>

        <FrostedCard style={styles.section}>
          <Text style={[textStyles.body, styles.sectionTitle]}>Account Details</Text>
          <View style={styles.detailRow}>
            <Icon name="mail-outline" size={20} color={colors.textSecondary} />
            <Text style={[textStyles.caption, styles.detailText]}>{user?.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="fitness-outline" size={20} color={colors.textSecondary} />
            <Text style={[textStyles.caption, styles.detailText]}>
              {experienceLevel?.level || 'Not set'}
            </Text>
          </View>
        </FrostedCard>

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
            color={colors.secondary}
          />
          <ActionCard
            icon="stats-chart"
            label="Progress"
            onPress={() => {}}
            color={colors.success}
          />
          <ActionCard
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
            color={colors.error}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    color: colors.card,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.card,
    textAlign: 'center',
    opacity: 0.8,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userIcon: {
    marginBottom: 16,
  },
  userName: {
    color: colors.card,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  userEmail: {
    color: colors.card,
    opacity: 0.8,
  },
  accountCard: {
    marginBottom: 24,
  },
  accountTitle: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountIcon: {
    marginRight: 12,
  },
  accountText: {
    color: colors.card,
    fontSize: 16,
  },
  actionCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    marginBottom: 16,
  },
  actionTitle: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionDescription: {
    color: colors.card,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButton: {
    height: 48,
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  signOutButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  signOutIcon: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  frostedCardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  frostedContent: {
    padding: spacing.md,
  },
  welcomeCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  welcomeText: {
    color: colors.card,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  nameText: {
    color: colors.card,
    fontSize: 32,
  },
  experienceSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  experienceLabel: {
    marginBottom: spacing.xs,
    color: colors.card,
    opacity: 0.8,
  },
  experienceValue: {
    color: colors.card,
    marginBottom: spacing.xs,
  },
  experienceDescription: {
    textAlign: 'center',
    color: colors.card,
    opacity: 0.8,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontWeight: '600',
    color: colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  detailText: {
    marginLeft: spacing.md,
    flex: 1,
    color: colors.text,
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
    alignItems: 'center',
  },
  actionCard: {
    height: CARD_WIDTH * 0.4,
    justifyContent: 'center',
    padding: spacing.sm,
    width: '100%',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  actionLabel: {
    flex: 1,
    color: colors.text,
    textAlign: 'center',
  },
});

export default ProfileScreen;