import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, textStyles, layoutStyles } from '../styles/sharedStyles';
import { supabase } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme colors matching the app's branding
const themeColors = {
  darkNavy: '#0E1E32',
  darkNavyLight: '#162C4A',
  darkNavyMedium: '#112338',
  goldAccent: '#D49B45',
  goldLight: '#E8B76D',
  goldDark: '#B37F2E',
  lightBlue: '#A4D4E4',
  lightBlueLight: '#C4E4F4',
  lightBlueDark: '#7BA8B8',
  white: '#FFFFFF',
  offWhite: 'rgba(255, 255, 255, 0.9)',
  transparent: 'transparent',
};

// Equipment options with enhanced data
const equipmentOptions = [
  {
    id: 'minimal',
    title: 'Minimal Equipment',
    description: 'Basic items like resistance bands, yoga mat, or small dumbbells',
    icon: 'fitness-outline',
    color: themeColors.lightBlue,
    gradient: [themeColors.lightBlueLight, themeColors.lightBlue],
    examples: ['Resistance bands', 'Yoga mat', 'Bodyweight exercises']
  },
  {
    id: 'dumbbells',
    title: 'Dumbbells',
    description: 'A set of dumbbells with various weights',
    icon: 'barbell-outline',
    color: themeColors.goldAccent,
    gradient: [themeColors.goldLight, themeColors.goldAccent],
    examples: ['Adjustable dumbbells', 'Fixed weight dumbbells', 'Kettlebells']
  },
  {
    id: 'bench',
    title: 'Bench & Basic Equipment',
    description: 'Weight bench with dumbbells and/or barbell',
    icon: 'barbell-outline',
    color: themeColors.lightBlue,
    gradient: [themeColors.lightBlueLight, themeColors.lightBlue],
    examples: ['Weight bench', 'Dumbbells', 'Basic barbell set']
  },
  {
    id: 'rack',
    title: 'Squat Rack',
    description: 'Squat rack or power rack with barbell and plates',
    icon: 'barbell-outline',
    color: themeColors.goldAccent,
    gradient: [themeColors.goldLight, themeColors.goldAccent],
    examples: ['Squat rack', 'Power rack', 'Olympic barbell & plates']
  },
  {
    id: 'cardio',
    title: 'Cardio Equipment',
    description: 'Treadmill, stationary bike, or other cardio machines',
    icon: 'bicycle-outline',
    color: themeColors.lightBlue,
    gradient: [themeColors.lightBlueLight, themeColors.lightBlue],
    examples: ['Treadmill', 'Stationary bike', 'Elliptical']
  },
  {
    id: 'full',
    title: 'Full Gym',
    description: 'Access to a complete gym with various equipment',
    icon: 'fitness-outline',
    color: themeColors.goldAccent,
    gradient: [themeColors.goldLight, themeColors.goldAccent],
    examples: ['Commercial gym', 'Home gym setup', 'All equipment types']
  },
];

// Option card component for cleaner rendering
const EquipmentOption = ({ option, isSelected, onSelect, isSmallScreen }) => {
  const scaleAnim = useState(new Animated.Value(1))[0];
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View 
      style={[
        styles.optionButtonContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => onSelect(option.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={[themeColors.darkNavyMedium, themeColors.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.optionButton,
            isSelected && { borderColor: option.color, borderWidth: 1.5 }
          ]}
        >
          {/* Left accent bar */}
          {isSelected && (
            <View
              style={[styles.selectedAccent, { backgroundColor: option.color }]}
            />
          )}
          
          {/* Icon container with gradient */}
          <LinearGradient
            colors={isSelected ? option.gradient : [`${option.color}20`, `${option.color}30`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.optionIconContainer]}
          >
            <Icon 
              name={option.icon} 
              size={isSmallScreen ? 20 : 24} 
              color={isSelected ? themeColors.darkNavy : option.color} 
            />
          </LinearGradient>
          
          {/* Text content */}
          <View style={styles.optionTextContainer}>
            <Text 
              style={[
                styles.optionTitle,
                isSmallScreen && { fontSize: 15 },
                isSelected && { color: option.color, fontWeight: '700' }
              ]}
            >
              {option.title}
            </Text>
            <Text 
              style={[
                styles.optionDescription,
                isSmallScreen && { fontSize: 13 },
              ]}
              numberOfLines={2}
            >
              {option.description}
            </Text>
            
            {/* Show examples only when selected */}
            {isSelected && (
              <View style={styles.examplesContainer}>
                {option.examples.map((example, idx) => (
                  <View 
                    key={idx} 
                    style={[styles.exampleTag, { backgroundColor: `${option.color}20` }]}
                  >
                    <Text style={[styles.exampleText, { color: option.color }]}>
                      {example}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          {/* Checkmark */}
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <LinearGradient
                colors={option.gradient}
                style={styles.checkmarkBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="checkmark" size={16} color={themeColors.darkNavy} />
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const WorkoutEquipmentScreen = () => {
  const navigation = useNavigation();
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedPreference, setSavedPreference] = useState(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallScreen = width < 350;

  // Button animation
  const buttonOpacity = useState(new Animated.Value(0))[0];
  const buttonTranslateY = useState(new Animated.Value(20))[0];

  useEffect(() => {
    // Check if user already has a preference
    const fetchUserPreference = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata && user.user_metadata.equipment_preference) {
          const pref = user.user_metadata.equipment_preference;
          setSavedPreference(pref);
          setSelectedEquipment(pref);
        }
      } catch (error) {
        console.error('Error fetching user preference:', error);
      }
    };

    fetchUserPreference();
  }, []);

  // Animate button when selection changes
  useEffect(() => {
    if (selectedEquipment) {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedEquipment]);

  const handleSelect = (equipmentId) => {
    setSelectedEquipment(equipmentId);
  };

  const handleSubmit = async () => {
    if (!selectedEquipment || loading) return;

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

  const padding = {
    paddingLeft: Math.max(16, insets.left),
    paddingRight: Math.max(16, insets.right),
  };

  // Find the selected option for the header
  const selectedOption = equipmentOptions.find(opt => opt.id === selectedEquipment);

  return (
    <SafeAreaView 
      style={[{ flex: 1, backgroundColor: themeColors.darkNavy, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]} 
      edges={['left', 'right']}
    >
      <StatusBar barStyle="light-content" backgroundColor={themeColors.darkNavy} />
      <LinearGradient
        colors={[themeColors.darkNavyLight, themeColors.darkNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <Header title="Equipment Setup" />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, padding]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={selectedOption 
              ? selectedOption.gradient 
              : [themeColors.goldLight, themeColors.goldAccent]}
            style={styles.headerIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon 
              name={selectedOption ? selectedOption.icon : "barbell-outline"} 
              size={34} 
              color={themeColors.darkNavy} 
              style={styles.headerIcon} 
            />
          </LinearGradient>
          <Text style={[styles.subtitle, isSmallScreen && { fontSize: 17 }]}>
            {selectedEquipment 
              ? `${selectedOption.title} Selected` 
              : "What equipment do you have access to?"}
          </Text>
          <Text style={[styles.subtitleHint, isSmallScreen && { fontSize: 13 }]}>
            {selectedEquipment 
              ? "Your workouts will be customized based on your selection" 
              : "Choose the option that best matches your setup"}
          </Text>
        </View>

        {equipmentOptions.map((option, index) => (
          <EquipmentOption
            key={option.id}
            option={option}
            isSelected={selectedEquipment === option.id}
            onSelect={handleSelect}
            isSmallScreen={isSmallScreen}
          />
        ))}

        <Animated.View 
          style={[
            styles.buttonContainer, 
            { 
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
              marginBottom: insets.bottom ? insets.bottom : 20
            }
          ]}
        >
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={!selectedEquipment || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedOption 
                ? selectedOption.gradient 
                : [themeColors.goldLight, themeColors.goldAccent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color={themeColors.darkNavy} size="small" />
              ) : (
                <>
                  <Icon 
                    name="checkmark-circle-outline" 
                    size={22} 
                    color={themeColors.darkNavy}
                    style={styles.submitIcon}
                  />
                  <Text style={styles.submitButtonText}>
                    {savedPreference === selectedEquipment 
                      ? 'Continue with current setup' 
                      : 'Continue with this equipment'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding for the floating button
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerIcon: {
    marginRight: 2,  // Slight offset for better centering
  },
  subtitle: {
    color: themeColors.white,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitleHint: {
    color: themeColors.lightBlue,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.9,
    maxWidth: '85%',
  },
  optionButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 212, 228, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: themeColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    color: themeColors.white,
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 6,
  },
  examplesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  exampleTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkmarkContainer: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkBackground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    paddingHorizontal: 20,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: themeColors.darkNavy,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WorkoutEquipmentScreen;