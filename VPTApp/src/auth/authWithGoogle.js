import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../api/supabaseClient';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  native: 'vptapp://login',
  useProxy: true,
});

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
    },
  });

  if (error) {
    console.error('Google Sign-In Error:', error);
  } else {
    console.log('Google Sign-In Data:', data);
  }

  return { data, error };
}
