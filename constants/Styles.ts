import { Dimensions, Platform, StyleSheet } from 'react-native';
import { Colors } from './Colors';

const { width, height } = Dimensions.get('window');

// Responsive scaling factors
export const scale = (size: number) => (width / 375) * size;
export const verticalScale = (size: number) => (height / 812) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Breakpoints
export const isSmallScreen = width < 360;
export const isMediumScreen = width >= 360 && width < 414;
export const isLargeScreen = width >= 414;

export const Styles = StyleSheet.create({
  // Layouts
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentPadding: {
    padding: moderateScale(20),
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Shadows
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    android: {
      elevation: 3,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    }
  }),
  
  // Typography
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: moderateScale(8),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    marginBottom: moderateScale(16),
  },
  body: {
    fontSize: moderateScale(14),
    color: Colors.textPrimary,
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: moderateScale(8),
  },
});
