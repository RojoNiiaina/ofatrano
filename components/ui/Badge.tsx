import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

type BadgeStatus = 'success' | 'danger' | 'warning' | 'default';

interface BadgeProps {
  label: string;
  status?: BadgeStatus;
}

export function Badge({ label, status = 'default' }: BadgeProps) {
  
  const getStyles = () => {
    switch (status) {
      case 'success':
        return {
          bg: Colors.successBackground,
          text: Colors.success,
        };
      case 'danger':
        return {
          bg: Colors.dangerBackground,
          text: Colors.danger,
        };
      case 'warning':
        return {
          bg: Colors.warningBackground,
          text: Colors.warning,
        };
      default:
        return {
          bg: Colors.border,
          text: Colors.textSecondary,
        };
    }
  };

  const { bg, text } = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
