import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const themeColors = {
  darkNavy: '#0E1E32',
  darkNavyLight: '#162C4A',
  goldAccent: '#D49B45',
  goldLight: '#E8B76D',
  lightBlue: '#A4D4E4',
  white: '#FFFFFF',
};

// Helper to normalize exercise names for mapping
function normalizeName(name) {
  return name.trim().toLowerCase();
}

// Map normalized names to images
const exerciseImages = {
  'dumbbell chest press': require('../../assets/Dumbbell-Chest-Press.png'),
  'bodyweight squat': require('../../assets/Bodyweight-Squats.png'),
  'bodyweight squats': require('../../assets/Bodyweight-Squats.png'),
  'body weight squats': require('../../assets/Bodyweight-Squats.png'),
  // Add more mappings as needed
};

// Helper to capitalize each word
function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

const ExerciseCard = ({ exercise }) => {
  const normalized = normalizeName(exercise.name);
  console.log('Exercise name:', exercise.name, 'Normalized:', normalized);
  return (
    <>
      <LinearGradient
        colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Icon name="barbell-outline" size={22} color={themeColors.goldAccent} style={{ marginRight: 10 }} />
          <Text style={styles.exerciseName}>{capitalizeWords(exercise.name)}</Text>
          {exercise.label && (
            <View style={styles.labelTag}>
              <Text style={styles.labelText}>{exercise.label}</Text>
            </View>
          )}
        </View>
        <Text style={styles.instruction}>{exercise.instruction}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detail}><Text style={styles.detailLabel}>Sets:</Text> {exercise.sets}</Text>
          <Text style={styles.detail}><Text style={styles.detailLabel}>Reps:</Text> {exercise.reps}</Text>
          <Text style={styles.detail}><Text style={styles.detailLabel}>Rest:</Text> {exercise.rest}s</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detail}><Text style={styles.detailLabel}>Duration:</Text> {exercise.duration} min</Text>
          <Text style={styles.detail}><Text style={styles.detailLabel}>Level:</Text> {exercise.level}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detail}><Text style={styles.detailLabel}>Target Reps:</Text> {exercise.target_rep_min} - {exercise.target_rep_max}</Text>
        </View>
      </LinearGradient>
      {/* Show image below the card if available */}
      {exerciseImages[normalized] && (
        <View style={styles.imageContainer}>
          <Image
            source={exerciseImages[normalized]}
            style={styles.exerciseImage}
            resizeMode="contain"
          />
        </View>
      )}
    </>
  );
};

const GeneratedWorkoutScreen = ({ route, navigation }) => {
  const { exercises } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: themeColors.darkNavy,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
      edges={['left', 'right']}
    >
      <StatusBar barStyle="light-content" backgroundColor={themeColors.darkNavy} />
      <LinearGradient
        colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
        style={StyleSheet.absoluteFill}
      />
      <Header title="Your Workout" showBack={true} showSettings={false} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Today's Workout</Text>
        {exercises && exercises.length > 0 ? (
          exercises.map((exercise, idx) => (
            <ExerciseCard key={exercise.id || idx} exercise={exercise} />
          ))
        ) : (
          <Text style={styles.noExercises}>No exercises found for your selection.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  title: {
    color: themeColors.goldAccent,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    color: themeColors.white,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  labelTag: {
    backgroundColor: themeColors.goldAccent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  labelText: {
    color: themeColors.darkNavy,
    fontWeight: '600',
    fontSize: 12,
  },
  instruction: {
    color: themeColors.lightBlue,
    fontSize: 14,
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detail: {
    color: themeColors.white,
    fontSize: 13,
    flex: 1,
  },
  detailLabel: {
    color: themeColors.goldAccent,
    fontWeight: '600',
  },
  noExercises: {
    color: themeColors.white,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  exerciseImage: {
    width: '100%',
    height: 280,
  },
});

export default GeneratedWorkoutScreen; 