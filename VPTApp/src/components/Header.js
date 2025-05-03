import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const themeColors = {
  darkNavy: '#0E1E32',
  goldAccent: '#D49B45',
  lightBlue: '#A4D4E4',
  white: '#FFFFFF',
};

const Header = ({ title = 'VPT', showBack = true, showSettings = false }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const paddingTop = Platform.OS === 'ios' 
    ? insets.top 
    : StatusBar.currentHeight;

  return (
    <View style={[styles.header, { paddingTop }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={themeColors.darkNavy} 
      />
      
      <View style={styles.headerContent}>
        {showBack && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-back" size={24} color={themeColors.goldAccent} />
          </TouchableOpacity>
        )}
        
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../assets/VPT-logo-csumb-1.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        
        {showSettings && (
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="settings-outline" size={24} color={themeColors.goldAccent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: themeColors.darkNavy,
    borderBottomWidth: 1,
    borderBottomColor: `${themeColors.goldAccent}40`,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: themeColors.goldAccent,
  },
});

export default Header;