import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ExperienceQuestionnaireModal from '../components/ExperienceQuestionnaireModal';

const LandingScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [questionnaireResults, setQuestionnaireResults] = useState(null);
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false);

  const handleSubmit = () => {
    if (isLogin) {
      // Handle login logic here
      console.log('Login:', { email, password });
      // For demo purposes, just navigate to Profile screen
      // In a real app, you'd authenticate with Supabase first
      navigation.navigate('Profile');
    } else {
      // Handle signup logic here
      console.log('Signup:', { name, email, password });
      // For demo purposes, just navigate to Profile screen
      // In a real app, you'd register with Supabase first
      navigation.navigate('Profile');
    }
  };

  const openQuestionnaire = () => {
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

  const toggleSettingsMenu = () => {
    setSettingsMenuVisible(!settingsMenuVisible);
  };

  const navigateToDatabaseViewer = () => {
    setSettingsMenuVisible(false);
    navigation.navigate('DatabaseViewer');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Settings Icon */}
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={toggleSettingsMenu}
      >
        <Text style={styles.settingsIconText}>⚙️</Text>
      </TouchableOpacity>

      {/* Settings Menu */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={settingsMenuVisible}
        onRequestClose={() => setSettingsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.settingsModalOverlay}
          activeOpacity={1}
          onPress={() => setSettingsMenuVisible(false)}
        >
          <View 
            style={styles.settingsMenu}
            // Prevent touches on the menu from closing the modal
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.settingsMenuTitle}>Developer Options</Text>
            
            <TouchableOpacity 
              style={styles.settingsMenuItem}
              onPress={navigateToDatabaseViewer}
            >
              <Text style={styles.settingsMenuItemIcon}>🗄️</Text>
              <Text style={styles.settingsMenuItemText}>View Database Tables</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsMenuItem, styles.closeMenuItem]}
              onPress={() => setSettingsMenuVisible(false)}
            >
              <Text style={styles.closeMenuItemText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/VPT-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to VPT</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Sign in to continue' : 'Create your account'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.questionnaireButton]}
              onPress={openQuestionnaire}
            >
              <Text style={styles.buttonText}>
                Experience Questionnaire
              </Text>
            </TouchableOpacity>

            {questionnaireResults && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Questionnaire Results:</Text>
                <Text style={styles.resultsText}>
                  Total Score: {questionnaireResults.totalScore}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#007AFF',
    fontSize: 14,
  },
  questionnaireButton: {
    marginTop: 40,
    backgroundColor: '#34C759',
  },
  resultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultsText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  settingsIcon: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 10,
    padding: 8,
  },
  settingsIconText: {
    fontSize: 24,
  },
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsMenu: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  settingsMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  settingsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingsMenuItemIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  settingsMenuItemText: {
    fontSize: 16,
    color: '#333',
  },
  closeMenuItem: {
    justifyContent: 'center',
    marginTop: 10,
    borderBottomWidth: 0,
  },
  closeMenuItemText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LandingScreen; 