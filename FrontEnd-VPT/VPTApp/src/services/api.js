import { supabase } from '../config/supabase';

// Auth Operations
export const signUp = async (email, password, name) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error.message);
    return { data: null, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error.message);
    return { data: null, error: error.message };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error.message);
    return { error: error.message };
  }
};

// User Profile Operations
export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('userProfile')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('userProfile')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    return { data: null, error: error.message };
  }
};

// Experience Assessment Operations
export const saveQuestionnaireSession = async (sessionData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // First, insert the answer
    const { data: answerData, error: answerError } = await supabase
      .from('answer')
      .insert({
        user_id: user.id,
        question_id: sessionData.questionId,
        answer: sessionData.answer,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (answerError) throw answerError;

    // Then, update or insert the level
    const { data: levelData, error: levelError } = await supabase
      .from('level')
      .upsert({
        user_id: user.id,
        level: sessionData.level,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (levelError) throw levelError;

    return { 
      data: { answer: answerData, level: levelData }, 
      error: null 
    };
  } catch (error) {
    console.error('Error saving questionnaire session:', error.message);
    return { data: null, error: error.message };
  }
};

export const getUserExperienceLevel = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // Get the user's level
    const { data: levelData, error: levelError } = await supabase
      .from('level')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (levelError) throw levelError;

    // Get the user's answers
    const { data: answersData, error: answersError } = await supabase
      .from('answer')
      .select(`
        *,
        question:question(*)
      `)
      .eq('user_id', user.id);

    if (answersError) throw answersError;

    return { 
      data: { 
        level: levelData,
        answers: answersData
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error getting user experience level:', error.message);
    return { data: null, error: error.message };
  }
}; 