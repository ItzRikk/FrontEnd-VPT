import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserExperienceLevel } from '../services/experienceQuestionnaireService';
import ExperienceQuestionnaireModal from '../components/ExperienceQuestionnaireModal';
import { supabase } from '../api/supabaseClient';
import { saveQuestionnaireSession } from '../services/experienceQuestionnaireService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Get the current authenticated user
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        
        // Get current user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
          setUser(user);
          
          // Get the user's experience level if available
          try {
            const experienceData = await getUserExperienceLevel(user.id);
            if (experienceData) {
              setExperienceLevel(experienceData.experience_levels);
            }
          } catch (expError) {
            console.log('No experience data available yet', expError);
          }
        }
      } catch (error) {
        console.error('Error getting profile:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const handleOpenQuestionnaire = () => {
    setModalVisible(true);
  };

  const handleCloseQuestionnaire = () => {
    setModalVisible(false);
  };

  const handleSubmitQuestionnaire = async (results) => {
    console.log('Questionnaire Results:', results);
    
    if (user) {
      try {
        // Add user ID to the formatted data
        const sessionData = {
          ...results.formattedData,
          userId: user.id
        };
        
        // Save to the database
        await saveQuestionnaireSession(sessionData);
        
        // Update the local state with the new experience level
        setExperienceLevel({
          title: results.experienceLevel.title,
          description: results.experienceLevel.description,
          icon: results.experienceLevel.title === 'Novice' ? '🔰' : 
                results.experienceLevel.title === 'Intermediate' ? '💪' : '🏆'
        });
      } catch (error) {
        console.error('Error saving questionnaire data:', error);
      }
    }
    
    setModalVisible(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.email || 'User'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Experience</Text>
          
          {experienceLevel ? (
            <View style={styles.experienceContainer}>
              <View style={styles.experienceBadge}>
                <Text style={styles.experienceEmoji}>
                  {experienceLevel.icon}
                </Text>
              </View>
              <Text style={styles.experienceTitle}>{experienceLevel.title}</Text>
              <Text style={styles.experienceDescription}>
                {experienceLevel.description}
              </Text>
            </View>
          ) : (
            <View style={styles.noExperienceContainer}>
              <Text style={styles.noExperienceText}>
                Complete the fitness questionnaire to see your experience level.
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.questionnaireButton}
            onPress={handleOpenQuestionnaire}
          >
            <Text style={styles.buttonText}>
              {experienceLevel ? 'Update Experience Level' : 'Complete Fitness Questionnaire'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => {/* Handle account settings */}}
          >
            <Text style={styles.settingsButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingsButton, styles.logoutButton]}
            onPress={async () => {
              await supabase.auth.signOut();
              navigation.navigate('Landing');
            }}
          >
            <Text style={[styles.settingsButtonText, styles.logoutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ExperienceQuestionnaireModal
        visible={modalVisible}
        onClose={handleCloseQuestionnaire}
        onSubmit={handleSubmitQuestionnaire}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  experienceContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  experienceBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  experienceEmoji: {
    fontSize: 30,
  },
  experienceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  noExperienceContainer: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  noExperienceText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  questionnaireButton: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  logoutText: {
    color: '#fff',
  },
});

export default ProfileScreen; 