import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
} from 'react-native';
import { theme } from '../../styles/theme';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  autoCloseDuration?: number;
}

const containerStyle: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
};

const contentStyle: ViewStyle = {
  backgroundColor: theme.colors.surface,
  borderRadius: theme.spacing.xl,
  padding: theme.spacing.xxl,
  alignItems: 'center',
  shadowColor: theme.colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 8,
  width: '85%',
};

const checkmarkContainerStyle: ViewStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: theme.colors.successBg,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing.lg,
};

const checkmarkStyle: TextStyle = {
  fontSize: 48,
  color: theme.colors.success,
  fontWeight: '600',
};

const titleStyle: TextStyle = {
  ...theme.textStyles.button,
  color: theme.colors.textPrimary,
  marginBottom: theme.spacing.md,
  textAlign: 'center',
};

const messageStyle: TextStyle = {
  ...theme.textStyles.body,
  color: theme.colors.textSecondary,
  textAlign: 'center',
  lineHeight: 22,
};

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  onDismiss,
  autoCloseDuration = 3000,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          onDismiss();
        });
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [visible, scaleAnim, autoCloseDuration, onDismiss]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={containerStyle}>
        <Animated.View
          style={[
            contentStyle,
            {
              transform: [
                {
                  scale: scaleAnim,
                },
              ],
            },
          ]}
        >
          <View style={checkmarkContainerStyle}>
            <Text style={checkmarkStyle}>✓</Text>
          </View>
          <Text style={titleStyle}>¡Éxito!</Text>
          <Text style={messageStyle}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};
