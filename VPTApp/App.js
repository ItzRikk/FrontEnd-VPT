import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LandingScreen from './src/screens/LandingScreen'; // Make sure the path matches your folder structure

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <LandingScreen />
    </SafeAreaProvider>
  );
}
