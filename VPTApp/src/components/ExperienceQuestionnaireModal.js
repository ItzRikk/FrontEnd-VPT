import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import questionnaireStyles from './QuestionnaireModalStyles';

// Experience level definitions based on score
const EXPERIENCE_LEVELS = {
  NOVICE: { min: 0, max: 3, title: 'Novice', description: 'You\'re new to weight training or have limited experience. You\'ll benefit from learning proper techniques.' },
  INTERMEDIATE: { min: 4, max: 4, title: 'Intermediate', description: 'You have some experience but could use guidance with more complex lifts.' },
  ADVANCED: { min: 5, max: 10, title: 'Advanced', description: 'You\'re experienced with proper form on complex lifts and ready for advanced training.' },
};

// Questions and answers with their point values
const QUESTIONNAIRE_DATA = [
  {
    id: 'q_formal_coaching',
    question: 'Have you ever received formal coaching or instruction on lifting weights?',
    description: '(Examples: PE class, personal trainer, sports coach)',
    options: [
      { id: 'q1_opt1', text: 'Yes', points: 1, icon: '✓' },
      { id: 'q1_opt2', text: 'No', points: 0, icon: '✕' },
    ],
  },
  {
    id: 'q_experience_level',
    question: 'How would you describe your current experience with weight lifting?',
    description: '',
    options: [
      { 
        id: 'q2_opt1', 
        text: "I'm new and need help learning how to lift correctly.", 
        points: 1,
        icon: '🔰'
      },
      { 
        id: 'q2_opt2', 
        text: "I can use machines or do bodyweight exercises, but I'm unsure about dumbbells and barbells.", 
        points: 2,
        icon: '⚙️'
      },
      { 
        id: 'q2_opt3', 
        text: "I'm confident with some basic movements like squats, lunges, push-ups, or bench press, but I need help with barbell exercises like back squats or deadlifts.", 
        points: 3,
        icon: '💪'
      },
      { 
        id: 'q2_opt4', 
        text: "I'm confident doing advanced exercises like barbell squats, deadlifts, and bent-over rows with proper technique.", 
        points: 4,
        icon: '🏆'
      },
    ],
  },
];

const ExperienceQuestionnaireModal = ({ visible, onClose, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState(null);

  // Check if current question has been answered
  const isCurrentQuestionAnswered = () => {
    const currentQuestion = QUESTIONNAIRE_DATA[currentQuestionIndex];
    return answers[currentQuestion.id] !== undefined;
  };

  // Check if we are on the last question
  const isLastQuestion = () => {
    return currentQuestionIndex === QUESTIONNAIRE_DATA.length - 1;
  };

  // Calculate total score whenever answers change
  useEffect(() => {
    let score = 0;
    Object.keys(answers).forEach(questionId => {
      const answer = answers[questionId];
      score += answer.points;
    });
    setTotalScore(score);
    
    // Determine experience level based on score
    if (score <= EXPERIENCE_LEVELS.NOVICE.max) {
      setExperienceLevel(EXPERIENCE_LEVELS.NOVICE);
    } else if (score <= EXPERIENCE_LEVELS.INTERMEDIATE.max) {
      setExperienceLevel(EXPERIENCE_LEVELS.INTERMEDIATE);
    } else {
      setExperienceLevel(EXPERIENCE_LEVELS.ADVANCED);
    }
  }, [answers]);

  // Handle option selection
  const handleSelectOption = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (isLastQuestion()) {
      // Show results instead of submitting immediately
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Format data for database storage
  const formatSessionDataForStorage = (answers, totalScore, experienceLevel) => {
    // Map the answers to a format suitable for database storage
    const formattedResponses = Object.keys(answers).map(questionId => {
      const selectedOption = answers[questionId];
      return {
        questionId: questionId,
        optionId: selectedOption.id,
        points: selectedOption.points
      };
    });

    return {
      totalScore,
      experienceLevelId: experienceLevel.title.toUpperCase(),
      responses: formattedResponses
    };
  };

  // Update handleSubmit function to format data before submission
  const handleSubmit = () => {
    // Format data for storage
    const formattedData = formatSessionDataForStorage(answers, totalScore, experienceLevel);
    
    // Pass both raw data and formatted data for storage
    onSubmit({
      answers,
      totalScore,
      experienceLevel,
      formattedData
    });
    
    resetQuestionnaire();
  };

  // Reset the questionnaire
  const resetQuestionnaire = () => {
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  // Reset when modal is closed
  const handleModalClose = () => {
    resetQuestionnaire();
    onClose();
  };

  const currentQuestion = QUESTIONNAIRE_DATA[currentQuestionIndex];
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleModalClose}
    >
      <SafeAreaView style={questionnaireStyles.modalContainer}>
        <View style={[
          questionnaireStyles.modalContent,
          currentQuestionIndex === 1 ? questionnaireStyles.tallModalContent : null,
          showResults ? questionnaireStyles.resultsModalContent : null
        ]}>
          {!showResults ? (
            <>
              <View style={questionnaireStyles.progressContainer}>
                <Text style={questionnaireStyles.progressText}>
                  Question {currentQuestionIndex + 1} of {QUESTIONNAIRE_DATA.length}
                </Text>
                <View style={questionnaireStyles.progressBar}>
                  <View 
                    style={[
                      questionnaireStyles.progressFill,
                      { width: `${((currentQuestionIndex + 1) / QUESTIONNAIRE_DATA.length) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              <ScrollView contentContainerStyle={questionnaireStyles.scrollContent}>
                <Text style={questionnaireStyles.title}>Experience Questionnaire</Text>

                <View style={questionnaireStyles.questionContainer}>
                  <Text style={questionnaireStyles.questionText}>{currentQuestion.question}</Text>
                  {currentQuestion.description ? (
                    <Text style={questionnaireStyles.questionDescription}>
                      {currentQuestion.description}
                    </Text>
                  ) : null}

                  {currentQuestion.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        questionnaireStyles.optionContainer,
                        answers[currentQuestion.id]?.id === option.id
                          ? questionnaireStyles.optionContainerSelected
                          : null,
                      ]}
                      onPress={() => handleSelectOption(currentQuestion.id, option)}
                    >
                      <View
                        style={[
                          questionnaireStyles.radioOuter,
                          answers[currentQuestion.id]?.id === option.id
                            ? questionnaireStyles.radioOuterSelected
                            : null,
                        ]}
                      >
                        {answers[currentQuestion.id]?.id === option.id && (
                          <View style={questionnaireStyles.radioInner} />
                        )}
                      </View>
                      <Text
                        style={[
                          questionnaireStyles.optionIcon,
                          answers[currentQuestion.id]?.id === option.id
                            ? questionnaireStyles.optionIconSelected
                            : null,
                        ]}
                      >
                        {option.icon}
                      </Text>
                      <Text
                        style={[
                          questionnaireStyles.optionText,
                          answers[currentQuestion.id]?.id === option.id
                            ? questionnaireStyles.optionTextSelected
                            : null,
                        ]}
                      >
                        {option.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={questionnaireStyles.navigationContainer}>
                  {currentQuestionIndex > 0 && (
                    <TouchableOpacity 
                      style={[questionnaireStyles.navButton, questionnaireStyles.prevButton]} 
                      onPress={handlePreviousQuestion}
                    >
                      <Text style={[questionnaireStyles.navButtonText, questionnaireStyles.prevButtonText]}>
                        ← Previous
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      questionnaireStyles.navButton,
                      questionnaireStyles.nextButton,
                      !isCurrentQuestionAnswered() ? questionnaireStyles.disabledButton : null,
                    ]}
                    onPress={handleNextQuestion}
                    disabled={!isCurrentQuestionAnswered()}
                  >
                    <Text style={[questionnaireStyles.navButtonText, questionnaireStyles.nextButtonText]}>
                      {isLastQuestion() ? 'See Results' : 'Next →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          ) : (
            <ScrollView contentContainerStyle={questionnaireStyles.scrollContent}>
              <Text style={questionnaireStyles.title}>Your Experience Level</Text>
              
              <View style={questionnaireStyles.resultsSummary}>
                <View style={questionnaireStyles.experienceBadge}>
                  <Text style={questionnaireStyles.experienceEmoji}>
                    {experienceLevel === EXPERIENCE_LEVELS.NOVICE ? '🔰' :
                     experienceLevel === EXPERIENCE_LEVELS.INTERMEDIATE ? '💪' :
                     '🏆'}
                  </Text>
                </View>
                <Text style={questionnaireStyles.experienceTitle}>{experienceLevel?.title}</Text>
                <Text style={questionnaireStyles.experiencePoints}>Score: {totalScore} points</Text>
                <Text style={questionnaireStyles.experienceDescription}>{experienceLevel?.description}</Text>
              </View>
              
              <View style={questionnaireStyles.answersContainer}>
                <Text style={questionnaireStyles.answersTitle}>Your Answers:</Text>
                {Object.keys(answers).map((questionId) => {
                  const question = QUESTIONNAIRE_DATA.find(q => q.id === questionId);
                  const answer = answers[questionId];
                  return (
                    <View key={questionId} style={questionnaireStyles.answerItem}>
                      <Text style={questionnaireStyles.answerQuestion}>{question?.question}</Text>
                      <View style={questionnaireStyles.answerDetail}>
                        <Text style={questionnaireStyles.answerIcon}>{answer.icon}</Text>
                        <Text style={questionnaireStyles.answerText}>{answer.text}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={questionnaireStyles.resultsButtonsContainer}>
                <TouchableOpacity 
                  style={[questionnaireStyles.navButton, questionnaireStyles.prevButton]} 
                  onPress={resetQuestionnaire}
                >
                  <Text style={[questionnaireStyles.navButtonText, questionnaireStyles.prevButtonText]}>
                    Try Again
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[questionnaireStyles.navButton, questionnaireStyles.nextButton]}
                  onPress={handleSubmit}
                >
                  <Text style={[questionnaireStyles.navButtonText, questionnaireStyles.nextButtonText]}>
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ExperienceQuestionnaireModal; 