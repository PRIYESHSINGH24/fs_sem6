import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing } from '../../constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, ...props }: Props) {
  const { palette } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.mutedText}
        style={[
          styles.input,
          {
            borderColor: error ? palette.danger : palette.border,
            color: palette.text,
            backgroundColor: palette.card,
          },
        ]}
        {...props}
      />
      {!!error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: spacing.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    fontSize: 15,
  },
  error: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: '500',
  },
});
