import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export const colors = {
  primary: '#FF3B30',
  secondary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  error: '#FF3B30',
  success: '#34C759',
  overlay: 'rgba(0, 0, 0, 0.5)',
  gradient: {
    start: '#FF3B30',
    end: '#FF9500',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const gradients = {
  primary: ['#007AFF', '#5856D6'],
  success: ['#34C759', '#30D158'],
  warning: ['#FF9500', '#FF9F0A'],
  error: ['#FF3B30', '#FF453A'],
};

export const cardStyles = StyleSheet.create({
  container: {
    
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  gradientContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export const textStyles = StyleSheet.create({
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.41,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.35,
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.text,
    letterSpacing: -0.41,
  },
  caption: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    letterSpacing: -0.24,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.41,
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.card,
    letterSpacing: -0.41,
  },
  textSecondary: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.41,
  },
});

export const inputStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 17,
    color: colors.text,
    letterSpacing: -0.41,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: -0.24,
  },
});

export const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const GradientCard = ({ style, children }) => {
  return (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[layoutStyles.card, style]}
    >
      {children}
    </LinearGradient>
  );
};

export const BlurCard = ({ style, children }) => {
  return (
    <BlurView
      style={[layoutStyles.card, style]}
      intensity={80}
      tint="light"
    >
      {children}
    </BlurView>
  );
}; 