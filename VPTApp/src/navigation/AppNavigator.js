import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../screens/LandingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DatabaseViewerScreen from '../screens/DatabaseViewerScreen';

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
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Your Profile'
        }}
      />
      <Stack.Screen 
        name="DatabaseViewer" 
        component={DatabaseViewerScreen}
        options={{
          title: 'Database Viewer'
        }}
      />
      {/* Add other screens here */}
    </Stack.Navigator>
  );
};

export default AppNavigator; 