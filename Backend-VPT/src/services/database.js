import { supabase } from '../config/supabase';

export const database = {
  // User Profile Operations
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('userProfile')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user profile:', error.message);
      return { data: null, error };
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('userProfile')
        .upsert({
          user_id: userId,
          ...profileData
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error.message);
      return { data: null, error };
    }
  },

  // Experience Assessment Operations
  async saveQuestionnaireSession(sessionData) {
    try {
      const { data, error } = await supabase
        .from('questionnaire_sessions')
        .insert(sessionData);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving questionnaire session:', error.message);
      return { data: null, error };
    }
  },

  async getUserExperienceLevel(userId) {
    try {
      const { data, error } = await supabase
        .from('questionnaire_sessions')
        .select(`
          total_score,
          completed_at,
          experience_levels (
            level_id,
            title,
            description,
            icon
          )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user experience level:', error.message);
      return { data: null, error };
    }
  },

  // Exercise Operations
  async getExercises() {
    try {
      const { data, error } = await supabase
        .from('exercise')
        .select('*');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting exercises:', error.message);
      return { data: null, error };
    }
  },

  async getEquipment() {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting equipment:', error.message);
      return { data: null, error };
    }
  }
}; 