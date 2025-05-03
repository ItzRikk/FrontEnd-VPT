import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, textStyles, layoutStyles } from '../styles/sharedStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
};

// Mock data for workout progress
const mockWorkoutData = {
  totalWorkouts: 24,
  totalHours: 36,
  caloriesBurned: 12000,
  streak: 5,
  recentWorkouts: [
    {
      id: 1,
      date: '2024-03-20',
      type: 'Strength Training',
      duration: '45 min',
      calories: 450,
      exercises: ['Bench Press', 'Squats', 'Deadlifts'],
    },
    {
      id: 2,
      date: '2024-03-18',
      type: 'Cardio',
      duration: '30 min',
      calories: 300,
      exercises: ['Running', 'Jump Rope'],
    },
    {
      id: 3,
      date: '2024-03-15',
      type: 'HIIT',
      duration: '40 min',
      calories: 500,
      exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats'],
    },
  ],
  progressStats: {
    strength: {
      benchPress: '+10kg',
      squat: '+15kg',
      deadlift: '+20kg',
    },
    endurance: {
      running: '+5 min',
      cycling: '+10 min',
    },
  },
};

// Stat card config objects
const statCards = [
  {
    title: 'Total Workouts',
    value: mockWorkoutData.totalWorkouts,
    icon: 'barbell-outline',
    color: themeColors.goldAccent,
    gradient: ['#D49B4510', '#D49B4530'],
  },
  {
    title: 'Total Hours',
    value: mockWorkoutData.totalHours,
    icon: 'time-outline',
    color: themeColors.lightBlue,
    gradient: ['#A4D4E410', '#A4D4E430'],
  },
  {
    title: 'Calories Burned',
    value: mockWorkoutData.caloriesBurned,
    icon: 'flame-outline',
    color: themeColors.goldAccent,
    gradient: ['#D49B4510', '#D49B4530'],
  },
  {
    title: 'Current Streak',
    value: `${mockWorkoutData.streak} days`,
    icon: 'trophy-outline',
    color: themeColors.lightBlue,
    gradient: ['#A4D4E410', '#A4D4E430'],
  },
];

const ProgressScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallScreen = width < 350;

  const renderStatCard = (stat, index) => (
    <View key={index} style={styles.statCardContainer}>
      <LinearGradient
        colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statCard}
      >
        <LinearGradient
          colors={stat.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statGradientOverlay}
        />
        <View style={[styles.statIconContainer, { borderColor: stat.color }]}>
          <Icon name={stat.icon} size={24} color={stat.color} />
        </View>
        <Text style={[styles.statValue, isSmallScreen && { fontSize: 20 }]}>{stat.value}</Text>
        <Text style={[styles.statLabel, { color: stat.color }]}>{stat.title}</Text>
      </LinearGradient>
    </View>
  );

  const renderWorkoutCard = (workout, index) => {
    const isGold = index % 2 === 0;
    const accentColor = isGold ? themeColors.goldAccent : themeColors.lightBlue;
    
    return (
      <TouchableOpacity 
        key={workout.id} 
        style={styles.workoutCardContainer}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.workoutCard}
        >
          <View style={[styles.workoutAccent, { backgroundColor: accentColor }]} />
          
          <View style={styles.workoutHeader}>
            <Text style={styles.workoutDate}>{workout.date}</Text>
            <Text style={[styles.workoutType, { color: accentColor }]}>{workout.type}</Text>
          </View>
          
          <View style={styles.workoutDetails}>
            <View style={styles.detailItem}>
              <Icon name="time-outline" size={16} color={accentColor} />
              <Text style={styles.detailText}>{workout.duration}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="flame-outline" size={16} color={accentColor} />
              <Text style={styles.detailText}>{workout.calories} cal</Text>
            </View>
          </View>
          
          <View style={styles.exercisesContainer}>
            {workout.exercises.map((exercise, idx) => (
              <View 
                key={idx} 
                style={[styles.exerciseTag, { backgroundColor: `${accentColor}20` }]}
              >
                <Text style={[styles.exerciseText, { color: themeColors.white }]}>{exercise}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderProgressSection = (title, data, useGold) => {
    const accentColor = useGold ? themeColors.goldAccent : themeColors.lightBlue;
    
    return (
      <View style={styles.progressSectionContainer}>
        <LinearGradient
          colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.progressSection, { borderLeftColor: accentColor }]}
        >
          <Text style={[styles.progressTitle, { color: accentColor }]}>{title}</Text>
          
          {Object.entries(data).map(([exercise, progress], idx) => (
            <View key={exercise} style={styles.progressItem}>
              <View style={styles.progressExerciseContainer}>
                <Icon 
                  name={useGold ? "barbell-outline" : "bicycle-outline"} 
                  size={14} 
                  color={accentColor} 
                  style={styles.progressItemIcon}
                />
                <Text style={styles.progressExercise}>{exercise}</Text>
              </View>
              <View style={[styles.progressValueContainer, { backgroundColor: `${accentColor}15` }]}>
                <Text style={[styles.progressValue, { color: accentColor }]}>{progress}</Text>
              </View>
            </View>
          ))}
        </LinearGradient>
      </View>
    );
  };

  const padding = {
    paddingLeft: Math.max(16, insets.left),
    paddingRight: Math.max(16, insets.right),
  };

  return (
    <SafeAreaView 
      style={[{ flex: 1, backgroundColor: themeColors.darkNavy, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]} 
      edges={['left', 'right']}
    >
      <StatusBar barStyle="light-content" backgroundColor={themeColors.darkNavy} />
      <LinearGradient
        colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <Header title="Progress" />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }, padding]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          {statCards.map((stat, index) => renderStatCard(stat, index))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[themeColors.goldAccent, themeColors.lightBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sectionHeaderAccent}
            />
            <View style={styles.sectionTitleContainer}>
              <Icon name="analytics-outline" size={22} color={themeColors.goldAccent} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, isSmallScreen && { fontSize: 18 }]}>Recent Workouts</Text>
            </View>
          </View>
          
          {mockWorkoutData.recentWorkouts.map((workout, index) => renderWorkoutCard(workout, index))}
          
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Workouts</Text>
            <Icon name="chevron-forward" size={16} color={themeColors.lightBlue} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[themeColors.lightBlue, themeColors.goldAccent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sectionHeaderAccent}
            />
            <View style={styles.sectionTitleContainer}>
              <Icon name="trending-up-outline" size={22} color={themeColors.lightBlue} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, isSmallScreen && { fontSize: 18 }]}>Progress Stats</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            {renderProgressSection('Strength', mockWorkoutData.progressStats.strength, true)}
            {renderProgressSection('Endurance', mockWorkoutData.progressStats.endurance, false)}
          </View>
        </View>
        
        <View style={styles.footerContainer}>
          <LinearGradient 
            colors={[themeColors.darkNavyLight, themeColors.darkNavy]} 
            style={styles.footerCard}
          >
            <View style={styles.footerIconRow}>
              <View style={[styles.footerIconWrapper, { backgroundColor: `${themeColors.goldAccent}15`, borderColor: themeColors.goldAccent }]}>
                <Icon name="barbell-outline" size={22} color={themeColors.goldAccent} />
              </View>
              <View style={[styles.footerIconWrapper, { backgroundColor: `${themeColors.lightBlue}15`, borderColor: themeColors.lightBlue }]}>
                <Icon name="bicycle-outline" size={22} color={themeColors.lightBlue} />
              </View>
              <View style={[styles.footerIconWrapper, { backgroundColor: `${themeColors.goldAccent}15`, borderColor: themeColors.goldAccent }]}>
                <Icon name="fitness-outline" size={22} color={themeColors.goldAccent} />
              </View>
            </View>
            
            <View style={styles.motivationContainer}>
              <Text style={[styles.motivationText, isSmallScreen && { fontSize: 14 }]}>
                "Transform your fitness journey with VPT"
              </Text>
              <LinearGradient
                colors={[themeColors.goldAccent, themeColors.lightBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.motivationDivider}
              />
              <Text style={[styles.motivationSubtext, isSmallScreen && { fontSize: 12 }]}>
                Track your progress. Stay motivated. Achieve more.
              </Text>
            </View>
          </LinearGradient>
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
    padding: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCardContainer: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  statCard: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  statGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(14, 30, 50, 0.5)',
    borderWidth: 1.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: themeColors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 16,
    position: 'relative',
  },
  sectionHeaderAccent: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: 5,
    height: 20,
    borderRadius: 2.5,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.white,
  },
  workoutCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  workoutCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  workoutAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  workoutDate: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.white,
    opacity: 0.8,
  },
  workoutType: {
    fontSize: 14,
    fontWeight: '600',
  },
  workoutDetails: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: themeColors.white,
    marginLeft: 6,
  },
  exercisesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exerciseTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  exerciseText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  viewAllText: {
    fontSize: 14,
    color: themeColors.lightBlue,
    marginRight: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSectionContainer: {
    width: '48%',
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
  progressSection: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
    borderLeftWidth: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressItem: {
    marginBottom: 10,
  },
  progressExerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressItemIcon: {
    marginRight: 6,
  },
  progressExercise: {
    fontSize: 14,
    color: themeColors.white,
    opacity: 0.9,
  },
  progressValueContainer: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 2,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 8,
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
  footerCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
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
    width: 100,
    height: 2,
    marginVertical: 10,
    borderRadius: 1,
  },
  motivationSubtext: {
    fontSize: 14,
    color: themeColors.lightBlue,
    opacity: 0.9,
    textAlign: 'center',
  },
});

export default ProgressScreen;