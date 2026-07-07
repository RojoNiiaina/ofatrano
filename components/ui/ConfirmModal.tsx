import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmModalProps) {
  const getIconName = () => {
    switch (variant) {
      case 'danger':
        return 'warning';
      case 'warning':
        return 'error-outline';
      default:
        return 'info';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'danger':
        return Colors.danger;
      case 'warning':
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (variant) {
      case 'danger':
        return styles.confirmButtonDanger;
      case 'warning':
        return styles.confirmButtonWarning;
      default:
        return styles.confirmButtonPrimary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={getIconName()} size={moderateScale(48)} color={getIconColor()} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmButton, getConfirmButtonStyle()]} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    width: '100%',
    maxWidth: moderateScale(400),
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: moderateScale(16),
  },
  title: {
    ...Styles.title,
    fontSize: moderateScale(20),
    textAlign: 'center',
    marginBottom: moderateScale(12),
  },
  message: {
    ...Styles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: moderateScale(24),
    lineHeight: moderateScale(22),
  },
  buttons: {
    flexDirection: 'row',
    gap: moderateScale(12),
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...Styles.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  confirmButtonDanger: {
    backgroundColor: Colors.danger,
  },
  confirmButtonWarning: {
    backgroundColor: Colors.warning,
  },
  confirmButtonText: {
    ...Styles.body,
    color: '#FFF',
    fontWeight: '600',
  },
});
