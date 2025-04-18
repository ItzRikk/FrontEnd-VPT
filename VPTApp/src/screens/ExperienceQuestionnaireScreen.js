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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, textStyles, buttonStyles, layoutStyles } from '../styles/sharedStyles';
import { supabase } from '../api/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

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
    if (points === 5) return { level: 'Advanced', description: 'You have significant experience with weight lifting' };
    return { level: 'Unknown', description: 'Unable to determine experience level' };
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
      
      navigation.navigate('Profile', { 
        questionnaireResults: {
          answers,
          totalPoints,
          experienceLevel
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

  if (fetchingQuestions) {
    return (
      <SafeAreaView style={[layoutStyles.container]} edges={['top']}>
        <LinearGradient
          colors={[colors.primary, '#FF9500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.card} />
          <Text style={[textStyles.body, styles.loadingText]}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={[layoutStyles.container]} edges={['top']}>
        <LinearGradient
          colors={[colors.primary, '#FF9500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <Icon name="alert-circle-outline" size={60} color={colors.card} />
          <Text style={[textStyles.title, styles.errorText]}>No questions available</Text>
          <Text style={[textStyles.body, styles.errorSubtext]}>
            Please contact support if this issue persists
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[layoutStyles.container]} edges={['top']}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[textStyles.title, styles.title]}>Experience Assessment</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="fitness-outline" size={40} color={colors.primary} style={styles.headerIcon} />
          <Text style={[textStyles.subtitle, styles.subtitle]}>
            Let's assess your fitness experience level
          </Text>
        </View>

        {questions.map((question) => (
          <FrostedCard key={question.id} style={styles.questionCard}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
              {question.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    answers[question.id] === option.id && styles.selectedOption
                  ]}
                  onPress={() => handleAnswer(question.id, option.id)}
                  disabled={loading}
                >
                  <View style={[
                    styles.optionIconContainer,
                    answers[question.id] === option.id && styles.selectedIconContainer
                  ]}>
                    <Icon 
                      name={option.icon || "radio-button-off"} 
                      size={24} 
                      color={answers[question.id] === option.id ? colors.card : colors.primary} 
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionTitle,
                      answers[question.id] === option.id && styles.selectedOptionText
                    ]}>
                      {option.text}
                    </Text>
                  </View>
                  {answers[question.id] === option.id && (
                    <View style={styles.checkmarkContainer}>
                      <Icon name="checkmark-circle" size={24} color={colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </FrostedCard>
        ))}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isComplete || loading) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!isComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <View style={styles.submitIconContainer}>
                <Icon 
                  name="checkmark-circle-outline" 
                  size={24} 
                  color={(!isComplete || loading) ? colors.textSecondary : colors.primary} 
                />
              </View>
              <Text style={[
                styles.submitButtonText,
                (!isComplete || loading) && styles.disabledButtonText
              ]}>
                Submit
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  headerIcon: {
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text,
  },
  questionCard: {
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedIconContainer: {
    backgroundColor: colors.card,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.card,
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitIconContainer: {
    marginRight: 8,
  },
  submitButtonText: {
    ...textStyles.subtitle,
    color: colors.text,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  loadingText: {
    color: colors.text,
    marginTop: 16,
  },
  errorText: {
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  frostedCardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  frostedContent: {
    padding: 24,
  },
});

export default ExperienceQuestionnaireScreen; 