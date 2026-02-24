import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'large' | 'medium' | 'small';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function GlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: GlassButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' ? colors.lavender : colors.cream}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${size}Text`],
            variant === 'ghost' && styles.ghostText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  primary: {
    backgroundColor: 'rgba(184,160,210,0.15)',
  },
  secondary: {
    backgroundColor: 'rgba(212,133,138,0.12)',
    borderColor: 'rgba(212,133,138,0.2)',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
  large: {
    height: 56,
    paddingHorizontal: 32,
  },
  medium: {
    height: 48,
    paddingHorizontal: 24,
  },
  small: {
    height: 36,
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: fonts.body.semiBold,
    color: colors.cream,
    letterSpacing: 0.5,
  },
  largeText: {
    fontSize: 16,
  },
  mediumText: {
    fontSize: 14,
  },
  smallText: {
    fontSize: 12,
  },
  ghostText: {
    color: colors.lavender,
  },
});
