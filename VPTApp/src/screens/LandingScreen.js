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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Checkbox from 'expo-checkbox'; // Install via: npm install expo-checkbox

const LandingScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const handleSubmit = () => {
    if (!disclaimerAccepted) {
      alert('Please accept the disclaimer before continuing.');
      return;
    }

    if (isLogin) {
      console.log('Login:', { email, password });
    } else {
      console.log('Signup:', { name, email, password });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

            <View style={styles.checkboxContainer}>
              <Checkbox
                value={disclaimerAccepted}
                onValueChange={setDisclaimerAccepted}
                style={styles.checkbox}
              />
              <Text style={styles.checkboxLabel}>
                I accept the{' '}
                <Text
                  style={styles.link}
                  onPress={() => setShowDisclaimerModal(true)}
                >
                  disclaimer
                </Text>
              </Text>
            </View>

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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Disclaimer Modal */}
      <Modal
        visible={showDisclaimerModal}
        animationType="slide"
        onRequestClose={() => setShowDisclaimerModal(false)}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Disclaimer</Text>
          <Text style={styles.modalText}>
            The workouts, exercises, and recommendations provided in this app are intended for general fitness and wellness purposes only. They are not a substitute for professional medical advice, diagnosis, or treatment.

            {'\n\n'}Before starting any exercise program, consult with your physician or a qualified healthcare provider, especially if you answer YES to any of the following:

            {'\n\n'}• Has your doctor ever said that you have a heart condition or high blood pressure?
            {'\n'}• Do you feel pain in your chest at rest, during daily activities, or when engaging in physical activity?
            {'\n'}• Do you lose balance due to dizziness or have you lost consciousness in the last 12 months? Not due to over-breathing, including during vigorous exercise.
            {'\n'}• Has your doctor ever advised that you should only perform medically supervised physical activity?
            {'\n'}• Are you pregnant, or is there a chance you have become pregnant in the last three months?

            {'\n\n'}If you answered YES to any of these questions, we strongly recommend that you stop using this app and seek medical advice before engaging in any physical activity.

            {'\n\n'}By using this app, you acknowledge that you are voluntarily participating in workouts at your own risk. The app developers, partners, and affiliates are not liable for any injuries, health complications, or adverse effects that may result from using this app.

            {'\n\n'}If you experience discomfort, pain, dizziness, or any unusual symptoms while exercising, stop immediately and seek medical attention.
          </Text>
          <TouchableOpacity
            style={[styles.button, { marginTop: 30 }]}
            onPress={() => setShowDisclaimerModal(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
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
  modalContainer: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default LandingScreen;
