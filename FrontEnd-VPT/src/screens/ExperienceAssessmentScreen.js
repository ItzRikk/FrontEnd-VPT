import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { supabase } from '../services/supabase';

const ExperienceAssessmentScreen = ({ navigation }) => {
  const [answers, setAnswers] = useState({
    q_experience_level: null,
    q_formal_coaching: null,
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const questions = {
    q_experience_level: {
      text: "What's your current experience level with fitness?",
      options: [
        {
          id: 'q2_opt1',
          text: "I'm completely new to fitness and exercise.",
          points: 1,
          icon: '🌱',
        },
        {
          id: 'q2_opt2',
          text: "I've done some basic exercises at home or in a gym, but I'm not sure about proper form.",
          points: 2,
          icon: '💪',
        },
        {
          id: 'q2_opt3',
          text: "I'm confident with some basic movements like squats, lunges, push-ups, or bench press, but I need help with barbell exercises like back squats or deadlifts.",
          points: 3,
          icon: '💪',
        },
        {
          id: 'q2_opt4',
          text: "I have several years of experience and can perform complex movements with good form.",
          points: 4,
          icon: '🏋️',
        },
      ],
    },
    q_formal_coaching: {
      text: "Have you ever worked with a personal trainer before?",
      options: [
        {
          id: 'q1_opt1',
          text: "Yes",
          points: 1,
          icon: '✓',
        },
        {
          id: 'q1_opt2',
          text: "No",
          points: 0,
          icon: '✗',
        },
      ],
    },
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    Object.values(answers).forEach(answer => {
      if (answer) {
        const option = questions[answer.questionId].options.find(opt => opt.id === answer.id);
        if (option) {
          totalScore += option.points;
        }
      }
    });
    return totalScore;
  };

  const determineExperienceLevel = (score) => {
    if (score <= 1) return 'BEGINNER';
    if (score <= 3) return 'INTERMEDIATE';
    return 'ADVANCED';
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const score = calculateScore();
      const experienceLevel = determineExperienceLevel(score);
      
      // Get the current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        throw new Error('No active session');
      }

      const userId = session.user.id;

      // Save responses to userIntakeResponses
      const { error: responseError } = await supabase
        .from('userIntakeResponses')
        .insert({
          user_id: userId,
          answers: answers,
          total_score: score,
        });

      if (responseError) throw responseError;

      // Update user profile with experience level
      const { error: profileError } = await supabase
        .from('userProfile')
        .upsert({
          user_id: userId,
          experience_level: experienceLevel,
        });

      if (profileError) throw profileError;

      // Set results for the modal
      setResults({
        score,
        experienceLevel,
        answers,
      });
      setShowResults(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (questionId) => {
    const question = questions[questionId];
    return (
      <View key={questionId} style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.text}</Text>
        <View style={styles.optionsContainer}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                answers[questionId]?.id === option.id && styles.selectedOption,
              ]}
              onPress={() => handleAnswer(questionId, { questionId, ...option })}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const ResultsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showResults}
      onRequestClose={() => setShowResults(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Assessment Results</Text>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Experience Level:</Text>
            <Text style={styles.resultValue}>{results?.experienceLevel}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Total Score:</Text>
            <Text style={styles.resultValue}>{results?.score}/5</Text>
          </View>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowResults(false);
              navigation.navigate('Dashboard');
            }}
          >
            <Text style={styles.modalButtonText}>Continue to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Experience Assessment</Text>
          <Text style={styles.subtitle}>Help us understand your fitness journey</Text>
        </View>

        <View style={styles.questionsContainer}>
          {Object.keys(questions).map(renderQuestion)}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (Object.keys(answers).length !== Object.keys(questions).length || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={Object.keys(answers).length !== Object.keys(questions).length || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Assessment'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <ResultsModal />
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  questionsContainer: {
    marginBottom: 30,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExperienceAssessmentScreen; 