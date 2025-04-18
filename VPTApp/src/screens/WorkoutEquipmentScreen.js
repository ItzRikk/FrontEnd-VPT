import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, textStyles, layoutStyles } from '../styles/sharedStyles';
import { supabase } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/Ionicons';

const equipmentOptions = [
  {
    id: 'minimal',
    title: 'Minimal Equipment',
    description: 'Basic items like resistance bands, yoga mat, or small dumbbells',
    icon: 'fitness-outline',
  },
  {
    id: 'dumbbells',
    title: 'Dumbbells',
    description: 'A set of dumbbells with various weights',
    icon: 'barbell-outline',
  },
  {
    id: 'bench',
    title: 'Bench & Basic Equipment',
    description: 'Weight bench with dumbbells and/or barbell',
    icon: 'barbell-outline',
  },
  {
    id: 'rack',
    title: 'Squat Rack',
    description: 'Squat rack or power rack with barbell and plates',
    icon: 'barbell-outline',
  },
  {
    id: 'cardio',
    title: 'Cardio Equipment',
    description: 'Treadmill, stationary bike, or other cardio machines',
    icon: 'bicycle-outline',
  },
  {
    id: 'full',
    title: 'Full Gym',
    description: 'Access to a complete gym with various equipment',
    icon: 'fitness-outline',
  },
];

const WorkoutEquipmentScreen = () => {
  const navigation = useNavigation();
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (equipmentId) => {
    setSelectedEquipment(equipmentId);
  };

  const handleSubmit = async () => {
    if (!selectedEquipment) return;

    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to save your equipment preferences.');
        navigation.navigate('Landing');
        return;
      }

      // Update user metadata with equipment preference
      const { error } = await supabase.auth.updateUser({
        data: {
          equipment_preference: selectedEquipment,
        }
      });

      if (error) throw error;

      // Navigate back to profile
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Error saving equipment preference:', error);
      Alert.alert('Error', 'Failed to save your equipment preference. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[layoutStyles.container]} edges={['top']}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[textStyles.title, styles.title]}>Equipment Setup</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="fitness-outline" size={40} color={colors.primary} style={styles.headerIcon} />
          <Text style={[textStyles.subtitle, styles.subtitle]}>
            What kind of workout equipment do you have available?
          </Text>
        </View>

        {equipmentOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedEquipment === option.id && styles.selectedOption
            ]}
            onPress={() => handleSelect(option.id)}
            disabled={loading}
          >
            <View style={[
              styles.optionIconContainer,
              selectedEquipment === option.id && styles.selectedIconContainer
            ]}>
              <Icon 
                name={option.icon} 
                size={24} 
                color={selectedEquipment === option.id ? colors.card : colors.primary} 
              />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[
                styles.optionTitle,
                selectedEquipment === option.id && styles.selectedOptionText
              ]}>
                {option.title}
              </Text>
              <Text style={[
                styles.optionDescription,
                selectedEquipment === option.id && styles.selectedOptionDescription
              ]}>
                {option.description}
              </Text>
            </View>
            {selectedEquipment === option.id && (
              <View style={styles.checkmarkContainer}>
                <Icon name="checkmark-circle" size={24} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedEquipment || loading) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!selectedEquipment || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <View style={styles.submitIconContainer}>
                <Icon 
                  name="checkmark-circle-outline" 
                  size={24} 
                  color={(!selectedEquipment || loading) ? colors.textSecondary : colors.primary} 
                />
              </View>
              <Text style={[
                styles.submitButtonText,
                (!selectedEquipment || loading) && styles.disabledButtonText
              ]}>
                Continue
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    color: colors.text,
    textAlign: 'center',
    opacity: 0.8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedOption: {
    backgroundColor: colors.card,
    borderColor: colors.primary,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedIconContainer: {
    backgroundColor: colors.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    color: colors.text,
    opacity: 0.8,
    fontSize: 14,
  },
  selectedOptionText: {
    color: colors.primary,
  },
  selectedOptionDescription: {
    color: colors.primary,
    opacity: 0.8,
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  submitButton: {
    height: 56,
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  submitIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  submitButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
});

export default WorkoutEquipmentScreen; 