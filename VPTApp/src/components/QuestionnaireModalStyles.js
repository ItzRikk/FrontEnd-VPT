import { StyleSheet } from 'react-native';

const questionnaireStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tallModalContent: {
    maxHeight: '90%',
  },
  resultsModalContent: {
    maxHeight: '90%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  questionContainer: {
    marginBottom: 25,
    minHeight: 250,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  questionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  optionContainerSelected: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  optionIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#888',
    width: 26,
    textAlign: 'center',
  },
  optionIconSelected: {
    color: '#007AFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    marginLeft: 10,
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  prevButton: {
    backgroundColor: '#f1f1f1',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    marginLeft: 10,
  },
  navButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  prevButtonText: {
    color: '#555',
  },
  nextButtonText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  
  // Results styles
  resultsSummary: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  experienceBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  experienceEmoji: {
    fontSize: 40,
  },
  experienceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  experiencePoints: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  answersContainer: {
    marginBottom: 25,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  answerItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  answerQuestion: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  answerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerIcon: {
    fontSize: 18,
    marginRight: 10,
    width: 26,
    textAlign: 'center',
    color: '#007AFF',
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  resultsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default questionnaireStyles; 