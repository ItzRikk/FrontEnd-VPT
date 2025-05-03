import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const themeColors = {
  darkNavy: '#0E1E32',
  darkNavyLight: '#162C4A',
  darkNavyMedium: '#112338',
  goldAccent: '#D49B45',
  goldLight: '#E8B76D',
  goldDark: '#B37F2E',
  lightBlue: '#A4D4E4',
  white: '#FFFFFF',
  warningColor: '#FF6B6B',
  warningLight: 'rgba(255, 107, 107, 0.15)',
};

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
  const scrollViewRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallScreen = width < 375;

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    if (isCloseToBottom && !isEndReached) {
      setIsEndReached(true);
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

  const safeAreaPadding = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.5)" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.modalGradient, { flex: 1, padding: 20, borderRadius: 16 }]}
            >
              <View style={styles.header}>
                <Text style={[
                  styles.title, 
                  isSmallScreen && styles.smallTitle
                ]}>
                  Terms & Disclaimer
                </Text>
                <TouchableOpacity 
                  onPress={isEndReached ? () => { onAccept && onAccept(); onClose && onClose(); } : undefined}
                  style={[
                    styles.closeButton, 
                    !isEndReached && styles.disabledButton,
                    { padding: isSmallScreen ? 6 : 8 }
                  ]}
                  disabled={!isEndReached}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon 
                    name="close" 
                    size={isSmallScreen ? 20 : 24} 
                    color={isEndReached ? themeColors.goldAccent : 'rgba(255, 255, 255, 0.4)'} 
                  />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={[
                  styles.scrollContent,
                  isSmallScreen && styles.smallPadding
                ]}
                onScroll={handleScroll}
                scrollEventThrottle={400}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[
                  styles.welcomeText,
                  isSmallScreen && styles.smallWelcomeText
                ]}>
                  Welcome to VPT (Virtual Personal Trainer)
                </Text>
                
                <Text style={[
                  styles.pleaseRead,
                  isSmallScreen && styles.smallPleaseRead
                ]}>
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
                  <Text style={[
                    styles.healthTitle,
                    isSmallScreen && styles.smallHealthTitle
                  ]}>
                    Health Screening Questions
                  </Text>
                  <Text style={[
                    styles.healthSubtitle,
                    isSmallScreen && styles.smallHealthSubtitle
                  ]}>
                    Please answer these questions honestly for your safety:
                  </Text>
                  
                  {HealthQuestions.map((question, index) => (
                    <View key={index} style={styles.questionItem}>
                      <Text style={styles.questionBullet}>•</Text>
                      <Text style={[
                        styles.questionText,
                        isSmallScreen && styles.smallQuestionText
                      ]}>
                        {question}
                      </Text>
                    </View>
                  ))}

                  <View style={styles.warningBox}>
                    <Icon 
                      name="warning-outline" 
                      size={isSmallScreen ? 20 : 24} 
                      color={themeColors.warningColor} 
                      style={styles.warningIcon} 
                    />
                    <Text style={[
                      styles.warningText,
                      isSmallScreen && styles.smallWarningText
                    ]}>
                      If you answered YES to any of these questions, we strongly recommend that you stop using this app and seek medical advice before engaging in any physical activity.
                    </Text>
                  </View>
                </View>

                <Text style={[
                  styles.acknowledgment,
                  isSmallScreen && styles.smallAcknowledgment
                ]}>
                  By using VPT, you acknowledge that you have read, understood, and agree to these terms and conditions, and have answered the health screening questions truthfully.
                </Text>
                
                {!isEndReached && (
                  <View style={styles.scrollIndicator}>
                    <Icon 
                      name="chevron-down" 
                      size={isSmallScreen ? 20 : 24} 
                      color={themeColors.goldAccent} 
                    />
                    <Text style={[
                      styles.scrollText,
                      isSmallScreen && styles.smallScrollText
                    ]}>
                      Continue scrolling to accept
                    </Text>
                  </View>
                )}
              </ScrollView>

              {isEndReached && (
                <TouchableOpacity
                  style={[
                    styles.acceptButton,
                    isSmallScreen && styles.smallAcceptButton
                  ]}
                  onPress={() => { onAccept && onAccept(); onClose && onClose(); }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.acceptButtonText,
                    isSmallScreen && styles.smallAcceptButtonText
                  ]}>
                    Accept & Continue
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 40,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.lightBlue,
    padding: 20,
    backgroundColor: themeColors.darkNavy,
    overflow: 'hidden',
    alignItems: 'stretch',
    minHeight: 776,
  },
  modalGradient: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(164, 212, 228, 0.2)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: themeColors.goldAccent,
  },
  smallTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  smallPadding: {
    padding: 16,
    paddingBottom: 30,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: themeColors.lightBlue,
    marginBottom: 16,
    textAlign: 'center',
  },
  smallWelcomeText: {
    fontSize: 18,
    marginBottom: 12,
  },
  pleaseRead: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  smallPleaseRead: {
    fontSize: 12,
    marginBottom: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: themeColors.goldAccent,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: themeColors.goldAccent,
    marginRight: 8,
    width: 16,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: themeColors.white,
    lineHeight: 22,
  },
  acknowledgment: {
    fontSize: 15,
    fontStyle: 'italic',
    color: themeColors.lightBlue,
    marginTop: 16,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  smallAcknowledgment: {
    fontSize: 13,
    marginTop: 12,
    marginBottom: 24,
  },
  healthQuestionsSection: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: themeColors.warningColor,
    marginBottom: 8,
    textAlign: 'center',
  },
  smallHealthTitle: {
    fontSize: 16,
  },
  healthSubtitle: {
    fontSize: 15,
    color: themeColors.white,
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  smallHealthSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  questionBullet: {
    fontSize: 16,
    color: themeColors.warningColor,
    marginRight: 8,
    width: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: themeColors.white,
    lineHeight: 22,
  },
  smallQuestionText: {
    fontSize: 13,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    color: themeColors.warningColor,
    fontWeight: '500',
    lineHeight: 22,
  },
  smallWarningText: {
    fontSize: 13,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(164, 212, 228, 0.2)',
    marginVertical: 24,
  },
  acceptButton: {
    backgroundColor: themeColors.goldAccent,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  smallAcceptButton: {
    margin: 16,
    padding: 14,
  },
  acceptButtonText: {
    color: themeColors.darkNavy,
    fontSize: 16,
    fontWeight: '600',
  },
  smallAcceptButtonText: {
    fontSize: 14,
  },
  scrollIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scrollText: {
    color: themeColors.goldAccent,
    fontSize: 14,
    marginTop: 4,
  },
  smallScrollText: {
    fontSize: 12,
  },
});

export default DisclaimerModal;