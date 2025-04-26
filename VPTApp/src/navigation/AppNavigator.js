import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../screens/LandingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExperienceQuestionnaireScreen from '../screens/ExperienceQuestionnaireScreen';
import WorkoutEquipmentScreen from '../screens/WorkoutEquipmentScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Landing" 
        component={LandingScreen}
        options={{
          title: 'Welcome'
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password'
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Your Profile'
        }}
      />
      <Stack.Screen 
        name="Questionnaire" 
        component={ExperienceQuestionnaireScreen}
        options={{
          title: 'Experience Assessment'
        }}
      />
      <Stack.Screen 
        name="WorkoutEquipment" 
        component={WorkoutEquipmentScreen}
        options={{
          title: 'Equipment Setup'
        }}
      />
      <Stack.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          title: 'Progress'
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings'
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 