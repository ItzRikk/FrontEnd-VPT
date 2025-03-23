import { supabase } from '../api/supabaseClient';

/**
 * Experience Questionnaire Service
 * Handles all interactions with the questionnaire data in Supabase
 */

/**
 * Saves a completed questionnaire session for a user
 * @param {Object} sessionData - The session data
 * @param {string} sessionData.userId - The user's ID
 * @param {number} sessionData.totalScore - The total score from the questionnaire
 * @param {string} sessionData.experienceLevelId - The determined experience level ID
 * @param {Array} sessionData.responses - Array of user responses
 * @returns {Promise} - Promise with the session data
 */
export const saveQuestionnaireSession = async (sessionData) => {
  try {
    // First, save the questionnaire session
    const { data: sessionResult, error: sessionError } = await supabase
      .from('questionnaire_sessions')
      .insert({
        user_id: sessionData.userId,
        total_score: sessionData.totalScore,
        experience_level_id: sessionData.experienceLevelId,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Then save each individual response
    const responsePromises = sessionData.responses.map(response => {
      return supabase
        .from('user_responses')
        .insert({
          session_id: sessionResult.session_id,
          question_id: response.questionId,
          selected_option_id: response.optionId,
          points_awarded: response.points,
        });
    });

    await Promise.all(responsePromises);

    return sessionResult;
  } catch (error) {
    console.error('Error saving questionnaire session:', error);
    throw error;
  }
};

/**
 * Gets the most recent experience level for a user
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise with the user's experience level data
 */
export const getUserExperienceLevel = async (userId) => {
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
    
    return data;
  } catch (error) {
    console.error('Error getting user experience level:', error);
    throw error;
  }
};

/**
 * Gets all responses for a specific session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - Promise with the session's response data
 */
export const getSessionResponses = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('user_responses')
      .select(`
        response_id,
        points_awarded,
        questions (
          question_id,
          question_text,
          question_description,
          question_order
        ),
        options (
          option_id,
          option_text,
          option_icon
        )
      `)
      .eq('session_id', sessionId)
      .order('questions.question_order', { ascending: true });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting session responses:', error);
    throw error;
  }
};

/**
 * Gets all available experience levels
 * @returns {Promise} - Promise with all experience level data
 */
export const getExperienceLevels = async () => {
  try {
    const { data, error } = await supabase
      .from('experience_levels')
      .select('*')
      .order('min_points', { ascending: true });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting experience levels:', error);
    throw error;
  }
};

/**
 * Determines the experience level ID based on a total score
 * @param {number} totalScore - The user's total questionnaire score
 * @returns {Promise<string>} - Promise with the experience level ID
 */
export const determineExperienceLevelId = async (totalScore) => {
  try {
    const { data, error } = await supabase
      .from('experience_levels')
      .select('level_id')
      .lte('min_points', totalScore)
      .gte('max_points', totalScore)
      .single();

    if (error) throw error;
    
    return data.level_id;
  } catch (error) {
    console.error('Error determining experience level:', error);
    throw error;
  }
}; 