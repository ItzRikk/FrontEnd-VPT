import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../styles/sharedStyles';

const DisclaimerSection = ({ title, items }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {items.map((item, index) => (
      <View key={index} style={styles.bulletPoint}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

const HealthQuestions = [
  "Has your doctor ever said that you have a heart condition or high blood pressure?",
  "Do you feel pain in your chest at rest, during daily activities, or when engaging in physical activity?",
  "Do you lose balance due to dizziness or have you lost consciousness in the last 12 months? Not due to over-breathing, including during vigorous exercise.",
  "Has your doctor ever advised that you should only perform medically supervised physical activity?",
  "Are you pregnant, or is there a chance you have become pregnant in the last three months?"
];

const DisclaimerModal = ({ visible, onAccept, onClose }) => {
  const [isEndReached, setIsEndReached] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const scrollViewRef = useRef(null);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    if (isCloseToBottom && !isEndReached) {
      setIsEndReached(true);
    }
  };

  const handleAccept = () => {
    if (isEndReached && isChecked) {
      onAccept();
    }
  };

  const disclaimerSections = [
    {
      title: "1. Health and Safety",
      items: [
        "Consult your physician before starting any exercise program",
        "This app is not a substitute for professional medical advice",
        "Stop exercising immediately if you experience pain or discomfort",
        "The exercises and recommendations provided are general in nature"
      ]
    },
    {
      title: "2. User Responsibility",
      items: [
        "You are responsible for your own safety during workouts",
        "Ensure you have adequate space and proper equipment",
        "Follow proper form and technique as demonstrated",
        "Listen to your body and work within your limits"
      ]
    },
    {
      title: "3. Medical Disclaimer",
      items: [
        "VPT does not provide medical advice",
        "The content is for informational purposes only",
        "Your use of the app is at your own risk",
        "We are not liable for any injuries or health issues"
      ]
    },
    {
      title: "4. Fitness Goals",
      items: [
        "Results may vary between individuals",
        "Success depends on many factors including diet, consistency, and effort",
        "No specific results are guaranteed"
      ]
    },
    {
      title: "5. Privacy and Data",
      items: [
        "Your health and fitness data is handled according to our privacy policy",
        "We use industry-standard security measures",
        "You control what information you share"
      ]
    },
    {
      title: "6. App Usage",
      items: [
        "The app requires a stable internet connection",
        "Features may be updated or modified",
        "Technical issues may occasionally occur"
      ]
    },
    {
      title: "7. Intellectual Property",
      items: [
        "All content is protected by copyright",
        "Do not share or distribute workout plans",
        "Respect the intellectual property rights"
      ]
    }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Terms & Disclaimer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            onScroll={handleScroll}
            scrollEventThrottle={400}
          >
            <Text style={styles.welcomeText}>
              Welcome to VPT (Virtual Personal Trainer)
            </Text>
            
            <Text style={styles.pleaseRead}>
              PLEASE READ THIS DISCLAIMER CAREFULLY BEFORE USING THE APP
            </Text>

            {disclaimerSections.map((section, index) => (
              <DisclaimerSection
                key={index}
                title={section.title}
                items={section.items}
              />
            ))}

            <View style={styles.divider} />

            <View style={styles.healthQuestionsSection}>
              <Text style={styles.healthTitle}>
                Health Screening Questions
              </Text>
              <Text style={styles.healthSubtitle}>
                Please answer these questions honestly for your safety:
              </Text>
              
              {HealthQuestions.map((question, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.questionText}>{question}</Text>
                </View>
              ))}

              <View style={styles.warningBox}>
                <Icon name="warning-outline" size={24} color={colors.warning} style={styles.warningIcon} />
                <Text style={styles.warningText}>
                  If you answered YES to any of these questions, we strongly recommend that you stop using this app and seek medical advice before engaging in any physical activity.
                </Text>
              </View>
            </View>

            <Text style={styles.acknowledgment}>
              By using VPT, you acknowledge that you have read, understood, and agree to these terms and conditions, and have answered the health screening questions truthfully.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.checkboxWrapper}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => isEndReached && setIsChecked(!isChecked)}
              >
                <View style={[styles.checkbox, isChecked && styles.checked]}>
                  {isChecked && <Icon name="checkmark" size={16} color="white" />}
                </View>
                <Text style={[
                  styles.checkboxLabel,
                  !isEndReached && styles.disabledText
                ]}>
                  I have read and agree to all terms
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.acceptButton,
                (!isEndReached || !isChecked) && styles.disabledButton
              ]}
              onPress={handleAccept}
              disabled={!isEndReached || !isChecked}
            >
              <Text style={[
                styles.acceptButtonText,
                (!isEndReached || !isChecked) && styles.disabledText
              ]}>
                Accept & Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.8,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    marginBottom: spacing.md,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pleaseRead: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  bullet: {
    fontSize: 16,
    color: colors.text,
    marginRight: spacing.xs,
    width: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  acknowledgment: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  checkboxWrapper: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledText: {
    color: colors.textLight,
  },
  healthQuestionsSection: {
    backgroundColor: '#FFF5F5',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  healthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  healthSubtitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  warningBox: {
    backgroundColor: `${colors.warning}15`,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 16,
    color: colors.warning,
    fontWeight: '500',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
});

export default DisclaimerModal; 