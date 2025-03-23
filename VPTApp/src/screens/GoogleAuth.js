import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../api/supabaseClient';

GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', 
});

const GoogleAuth = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { idToken } = await GoogleSignin.signIn();
      const { user, session, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        idToken,
      });
      
      if (error) {
        console.error("Google sign-in error:", error.message);
        return;
      }

      console.log('Signed in with Google:', user);
      // Redirect to your main app screen or handle post-login logic here.
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google sign-in is in progress');
      } else {
        console.error('Google sign-in failed', error);
      }
    }
  };

  return (
    <View>
      <Text>Sign in with Google</Text>
      <Button title="Sign in with Google" onPress={signInWithGoogle} />
    </View>
  );
};

export default GoogleAuth;
