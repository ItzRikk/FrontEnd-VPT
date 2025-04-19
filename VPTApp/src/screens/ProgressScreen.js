import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, textStyles, layoutStyles } from '../styles/sharedStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';

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

const ProgressScreen = () => {
  const navigation = useNavigation();

  const renderStatCard = (title, value, icon) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Icon name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  const renderWorkoutCard = (workout) => (
    <View key={workout.id} style={styles.workoutCard}>
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutDate}>{workout.date}</Text>
        <Text style={styles.workoutType}>{workout.type}</Text>
      </View>
      <View style={styles.workoutDetails}>
        <View style={styles.detailItem}>
          <Icon name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{workout.duration}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="flame-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{workout.calories} cal</Text>
        </View>
      </View>
      <View style={styles.exercisesContainer}>
        {workout.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseTag}>
            <Text style={styles.exerciseText}>{exercise}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[layoutStyles.container]} edges={['top']}>
      <Header title="Progress" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsContainer}>
          {renderStatCard('Total Workouts', mockWorkoutData.totalWorkouts, 'barbell-outline')}
          {renderStatCard('Total Hours', mockWorkoutData.totalHours, 'time-outline')}
          {renderStatCard('Calories Burned', mockWorkoutData.caloriesBurned, 'flame-outline')}
          {renderStatCard('Current Streak', `${mockWorkoutData.streak} days`, 'trophy-outline')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {mockWorkoutData.recentWorkouts.map(renderWorkoutCard)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Stats</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>Strength</Text>
              {Object.entries(mockWorkoutData.progressStats.strength).map(([exercise, progress]) => (
                <View key={exercise} style={styles.progressItem}>
                  <Text style={styles.progressExercise}>{exercise}</Text>
                  <Text style={styles.progressValue}>{progress}</Text>
                </View>
              ))}
            </View>
            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>Endurance</Text>
              {Object.entries(mockWorkoutData.progressStats.endurance).map(([exercise, progress]) => (
                <View key={exercise} style={styles.progressItem}>
                  <Text style={styles.progressExercise}>{exercise}</Text>
                  <Text style={styles.progressValue}>{progress}</Text>
                </View>
              ))}
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
    backgroundColor: colors.card,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    ...textStyles.title,
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    ...textStyles.subtitle,
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...textStyles.title,
    fontSize: 20,
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutDate: {
    ...textStyles.subtitle,
    fontSize: 14,
    opacity: 0.8,
  },
  workoutType: {
    ...textStyles.subtitle,
    fontSize: 14,
    color: colors.primary,
  },
  workoutDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    ...textStyles.subtitle,
    fontSize: 14,
    marginLeft: 4,
  },
  exercisesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exerciseTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  exerciseText: {
    ...textStyles.subtitle,
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSection: {
    width: '48%',
  },
  progressTitle: {
    ...textStyles.subtitle,
    fontSize: 16,
    marginBottom: 12,
    color: colors.primary,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressExercise: {
    ...textStyles.subtitle,
    fontSize: 14,
  },
  progressValue: {
    ...textStyles.subtitle,
    fontSize: 14,
    color: colors.primary,
  },
});

export default ProgressScreen; 