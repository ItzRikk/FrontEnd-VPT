import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Authentication functions
export const auth = {
  signUp: async (email, password) => {
    return await supabase.auth.signUp({ email, password });
  },
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  getUser: async () => {
    return await supabase.auth.getUser();
  }
};

// Intake form functions
export const intakeForm = {
  submitResponses: async (userId, responses) => {
    const { data, error } = await supabase
      .from('userIntakeResponses')
      .insert(responses.map(response => ({
        user_id: userId,
        question_id: response.questionId,
        answer_id: response.answerId
      })));
    return { data, error };
  },
  
  getQuestions: async () => {
    const { data, error } = await supabase
      .from('question')
      .select('*, answer(*)')
      .order('number');
    return { data, error };
  },

  getUserLevel: async (userId) => {
    const { data, error } = await supabase
      .from('userProfile')
      .select('level, points')
      .eq('user_id', userId)
      .single();
    return { data, error };
  }
}; 