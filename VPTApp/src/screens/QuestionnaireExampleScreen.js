import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import ExperienceQuestionnaireModal from '../components/ExperienceQuestionnaireModal';

const QuestionnaireExampleScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [questionnaireResults, setQuestionnaireResults] = useState(null);

  const handleOpenQuestionnaire = () => {
    setModalVisible(true);
  };

  const handleCloseQuestionnaire = () => {
    setModalVisible(false);
  };

  const handleSubmitQuestionnaire = (results) => {
    console.log('Questionnaire Results:', results);
    setQuestionnaireResults(results);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Experience Questionnaire Example</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleOpenQuestionnaire}
        >
          <Text style={styles.buttonText}>Open Questionnaire</Text>
        </TouchableOpacity>

        {questionnaireResults && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Results:</Text>
            <Text style={styles.resultsText}>
              Total Score: {questionnaireResults.totalScore}
            </Text>
            
            <View style={styles.answersContainer}>
              {Object.keys(questionnaireResults.answers).map((questionId) => {
                const answer = questionnaireResults.answers[questionId];
                return (
                  <View key={questionId} style={styles.answerItem}>
                    <Text style={styles.answerLabel}>{questionId}:</Text>
                    <Text style={styles.answerText}>
                      {answer.text} ({answer.points} points)
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      <ExperienceQuestionnaireModal
        visible={modalVisible}
        onClose={handleCloseQuestionnaire}
        onSubmit={handleSubmitQuestionnaire}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    color: '#007AFF',
  },
  answersContainer: {
    marginTop: 10,
  },
  answerItem: {
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#333',
  },
});

export default QuestionnaireExampleScreen; 