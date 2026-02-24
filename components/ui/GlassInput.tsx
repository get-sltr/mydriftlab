import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
} from 'react-native';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';

interface GlassInputProps extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export default function GlassInput({
  label,
  error,
  rightIcon,
  style,
  ...props
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, focused && styles.labelFocused]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.creamDim}
          selectionColor={colors.lavender}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontFamily: fonts.body.medium,
    fontSize: 12,
    color: colors.creamMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  labelFocused: {
    color: colors.lavender,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,32,53,0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(184,160,210,0.4)',
  },
  inputWrapperError: {
    borderColor: 'rgba(212,96,74,0.5)',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontFamily: fonts.body.regular,
    fontSize: 16,
    color: colors.cream,
  },
  rightIcon: {
    paddingRight: 12,
  },
  error: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.noise,
    marginTop: 6,
    marginLeft: 4,
  },
});
