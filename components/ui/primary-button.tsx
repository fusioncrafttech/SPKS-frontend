import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  color?: string;
};

export function PrimaryButton({ title, onPress, disabled, color = '#4338CA' }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color, opacity: disabled ? 0.6 : 1 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <ThemedText style={styles.text}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
