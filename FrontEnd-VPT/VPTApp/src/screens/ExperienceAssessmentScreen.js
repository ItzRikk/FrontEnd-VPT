import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../config/supabase';

const ExperienceAssessmentScreen = ({ navigation }) => {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questions = [
    {
      id: 'formal_coaching',
      text: "Have you ever received formal face-to-face coaching/instruction on lifting weights, such as taking a weight lifting physical education (PE) class, hiring a personal trainer, or receiving direct supervised coaching from a high school sports coach?",
      options: [
        {
          id: 'yes',
          text: "Yes",
          level: 1,
          icon: '✓'
        },
        {
          id: 'no',
          text: "No",
          level: 0,
          icon: '✗'
        }
      ]
    },
    {
      id: 'lifting_ability',
      text: 'How would you rate your current weight lifting ability?',
      options: [
        {
          id: 'basics',
          text: "I know some basics, but need more help on doing the lifts correctly",
          level: 1,
          icon: '🌱'
        },
        {
          id: 'machines',
          text: "I feel confident using the resistance training machines or body weight exercises, but need instruction on using barbells and dumbbells",
          level: 2,
          icon: '🏋️'
        },
        {
          id: 'basic_movements',
          text: "I feel confident doing some basic movements, like squats while holding dumbbells, lunges with no weight or dumbbells, push ups, bench press, but would need additional coaching on the bigger barbell exercises like barbell back squat or barbell deadlift",
          level: 3,
          icon: '💪'
        },
        {
          id: 'advanced',
          text: "I am confident in my ability to perform technically challenging exercises like barbell back squat, barbell deadlift, and barbell bent over rows safely and with good technique",
          level: 4,
          icon: '🎯'
        }
      ]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert('Please answer all questions');
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Calculate total level (formal_coaching points + lifting_ability points)
      const totalLevel = Object.values(answers).reduce((sum, answer) => sum + answer.level, 0);

      // First, ensure questions exist in the question table
      for (const question of questions) {
        const { error: questionError } = await supabase
          .from('question')
          .upsert({
            id: question.id,
            question: question.text,
            type: 'experience_assessment',
            number: currentQuestionIndex + 1
          });

        if (questionError) throw questionError;
      }

      // Then, save answers
      const { error: answerError } = await supabase
        .from('answer')
        .insert(
          Object.entries(answers).map(([questionId, answer]) => ({
            user_id: user.id,
            question_id: questionId,
            answer: answer.id,
            points: answer.level
          }))
        );

      if (answerError) throw answerError;

      // Finally, save level
      const { error: levelError } = await supabase
        .from('level')
        .upsert({
          user_id: user.id,
          level: totalLevel
        });

      if (levelError) throw levelError;

      navigation.replace('Profile');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      Alert.alert('Error', 'Failed to save your assessment');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Experience Assessment</Text>
        <Text style={styles.subtitle}>
          Help us understand your fitness level
        </Text>

        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>

        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                answers[currentQuestion.id]?.id === option.id && styles.selectedOption
              ]}
              onPress={() => handleAnswer(currentQuestion.id, option)}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.navigationContainer}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
            >
              <Text style={styles.prevButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                !answers[currentQuestion.id] && styles.disabledButton
              ]}
              disabled={!answers[currentQuestion.id]}
              onPress={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.submitButton,
                loading && styles.disabledButton
              ]}
              disabled={loading}
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 16,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: '#f5f5f5',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    marginLeft: 12,
  },
  prevButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ExperienceAssessmentScreen; 