import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../api/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const themeColors = {
  darkNavy: '#0E1E32', // Dark navy blue background
  darkNavyDarker: '#0A1726', // Darker navy for cards and backgrounds
  goldAccent: '#D49B45', // Gold/orange accent color
  lightBlue: '#A4D4E4', // Light blue for graphs/lines
  white: '#FFFFFF',
  offWhite: 'rgba(255, 255, 255, 0.8)',
  transparent: 'transparent',
  lightGoldBg: 'rgba(212, 155, 69, 0.1)', // Light gold for selected options
  cardBg: '#1B2D45', // Deeper blue for card backgrounds (from image)
  questionNumberBg: '#D8A554', // Gold circle background for question numbers
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

const ExperienceQuestionnaireScreen = () => {
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions...');
      const { data, error } = await supabase
        .from('question')
        .select('id, question, number, options, correct_answer')
        .order('number', { ascending: true });

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      console.log('Fetched questions:', data);
      if (data) {
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error in fetchQuestions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    } finally {
      setFetchingQuestions(false);
    }
  };

  const calculateTotalPoints = () => {
    let totalPoints = 0;
    Object.entries(answers).forEach(([questionId, answerId]) => {
      const question = questions.find(q => q.id === questionId);
      if (question && question.options) {
        const selectedOption = question.options.find(opt => opt.id === answerId);
        if (selectedOption) {
          totalPoints += selectedOption.points;
        }
      }
    });
    return totalPoints;
  };

  const determineExperienceLevel = (points) => {
    if (points <= 3) return { level: 'Novice', description: 'You are at the beginning of your weight lifting journey' };
    if (points === 4) return { level: 'Intermediate', description: 'You have some experience with weight lifting' };
    if (points === 5) return { level: 'Advance', description: 'You have significant experience with weight lifting' };
    return { level: 'Novice', description: 'Unable to determine experience level' };
  };

  const handleAnswer = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const totalPoints = calculateTotalPoints();
      const experienceLevel = determineExperienceLevel(totalPoints);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User error:', userError);
        throw userError;
      }
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to save your experience level');
        return;
      }

      console.log('Saving questionnaire for user:', user.id);
      console.log('Answers:', answers);
      console.log('Total points:', totalPoints);
      console.log('Experience level:', experienceLevel);

      // First check if user already has answers
      const { data: existingAnswers } = await supabase
        .from('questionnaire_answers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Store or update questionnaire answers
      const { data: answerData, error: answersError } = await supabase
        .from('questionnaire_answers')
        .upsert({
          id: existingAnswers?.id, // If exists, use the same ID to update
          user_id: user.id,
          answers: answers,
          total_points: totalPoints,
          experience_level: experienceLevel.level,
          updated_at: new Date().toISOString()
        })
        .select();

      if (answersError) {
        console.error('Answers error:', answersError);
        throw answersError;
      }

      console.log('Saved answers:', answerData);

      // Update user metadata with experience level
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          experience_level: experienceLevel.level,
          experience_description: experienceLevel.description
        }
      });

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Update userProfile table with experience level
      const { error: profileError } = await supabase
        .from('userProfile')
        .upsert({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata.name,
          level: experienceLevel.level // Using numeric level ID that matches the level table
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
      
      navigation.navigate('Profile', {
        questionnaireResults: {
          experienceLevel: {
            level: experienceLevel.level,
            description: experienceLevel.description
          }
        }
      });
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to save your experience level. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isComplete = Object.keys(answers).length === questions.length;

  // Loading state with matching dark theme
  if (fetchingQuestions) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[themeColors.darkNavy, '#0A1726']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.goldAccent} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state with matching dark theme
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[themeColors.darkNavy, '#0A1726']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <Icon name="alert-circle-outline" size={60} color={themeColors.goldAccent} />
          <Text style={styles.errorText}>No questions available</Text>
          <Text style={styles.errorSubtext}>
            Please contact support if this issue persists
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[themeColors.darkNavy, themeColors.darkNavyDarker]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/VPT-logo-csumb-1.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>Experience Assessment</Text>
        <Text style={styles.subtitle}>
          Let's assess your fitness experience level
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {questions.map((question, index) => (
          <View key={question.id} style={styles.questionCardWrapper}>
            <View style={styles.questionNumberCircle}>
              <Text style={styles.questionNumber}>{index + 1}</Text>
            </View>
            <View style={styles.questionCard}>
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>{question.question}</Text>
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionButton}
                      onPress={() => handleAnswer(question.id, option.id)}
                      disabled={loading}
                    >
                      <View style={styles.radioContainer}>
                        <View style={[
                          styles.radioOuter,
                          isSelected && styles.radioOuterSelected
                        ]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </View>
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText
                      ]}>
                        {option.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ))}
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isComplete || loading) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!isComplete || loading}
        >
          <Icon 
            name={loading ? "reload-outline" : "checkmark-circle-outline"} 
            size={20} 
            color={themeColors.darkNavy} 
            style={styles.submitIcon}
          />
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Assessment'}
          </Text>
        </TouchableOpacity>
        
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: themeColors.darkNavy,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: themeColors.goldAccent,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: themeColors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: themeColors.lightBlue,
    textAlign: 'center',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  questionCardWrapper: {
    marginBottom: 20,
    position: 'relative',
    paddingTop: 15,
  },
  questionNumberCircle: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: themeColors.questionNumberBg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  questionNumber: {
    color: themeColors.darkNavy,
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: themeColors.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  questionContainer: {
    width: '100%',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.white,
    marginBottom: 20,
    paddingRight: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: themeColors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioOuterSelected: {
    borderColor: themeColors.goldAccent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: themeColors.goldAccent,
  },
  selectedOption: {
    backgroundColor: themeColors.lightGoldBg,
    borderColor: themeColors.goldAccent,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: themeColors.goldAccent,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: themeColors.white,
  },
  selectedOptionText: {
    color: themeColors.goldAccent,
    fontWeight: '500',
  },
  checkmark: {
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.goldAccent,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.darkNavy,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: themeColors.white,
    marginTop: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: themeColors.white,
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: themeColors.lightBlue,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  footerContainer: {
    width: '100%',
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  footerIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  footerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themeColors.darkNavy,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: `${themeColors.goldAccent}30`,
  },
  motivationContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.goldAccent,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  motivationDivider: {
    width: 40,
    height: 2,
    backgroundColor: `${themeColors.lightBlue}30`,
    marginVertical: 8,
  },
  motivationSubtext: {
    fontSize: 14,
    color: themeColors.goldAccent,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default ExperienceQuestionnaireScreen;