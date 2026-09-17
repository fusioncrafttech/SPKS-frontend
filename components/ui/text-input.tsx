import { StyleSheet, TextInput as RNTextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';

export type ThemedTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function TextInput({
  label,
  error,
  style,
  ...rest
}: ThemedTextInputProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && <ThemedText style={[styles.label, { color: colors.text }]}>{label}</ThemedText>}
      <RNTextInput
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.danger : colors.border,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
      {error && <ThemedText style={[styles.error, { color: colors.danger }]}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
});
