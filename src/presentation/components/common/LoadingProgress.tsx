import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

export interface LoadingStep {
  message: string;
  progress: number; // 0 a 1: hasta dónde llega la barra en este paso
  duration: number; // ms que tarda en llegar
}

interface LoadingProgressProps {
  steps?: LoadingStep[];
  onComplete?: () => void;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_STEPS: LoadingStep[] = [
  { message: 'Verificando sesión...', progress: 0.25, duration: 600 },
  { message: 'Sincronizando sensores y red comunitaria...', progress: 0.6, duration: 900 },
  { message: 'Comprobando telemetría de caudales...', progress: 0.9, duration: 700 },
  { message: 'Red hídrica validada. Iniciando...', progress: 1, duration: 400 },
];

const COMPLETE_DELAY_MS = 400;
const BAR_HEIGHT = 6;
const ICON_SIZE = 16;

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  steps = DEFAULT_STEPS,
  onComplete,
  style,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const [stepIndex, setStepIndex] = useState(0);
  const [percent, setPercent] = useState(0);

  // Guardamos onComplete en un ref para no reiniciar la secuencia si el padre re-renderiza
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const isDone = stepIndex === steps.length - 1 && percent === 100;

  // Secuencia de pasos: anima la barra hasta el progreso de cada paso
  useEffect(() => {
    let cancelled = false;
    let completeTimer: ReturnType<typeof setTimeout> | undefined;

    const listenerId = progress.addListener(({ value }) => {
      setPercent(Math.round(value * 100));
    });

    const runStep = (i: number) => {
      if (cancelled) return;
      setStepIndex(i);
      Animated.timing(progress, {
        toValue: steps[i].progress,
        duration: steps[i].duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // se anima 'width', no puede ir en el driver nativo
      }).start(({ finished }) => {
        if (!finished || cancelled) return;
        if (i < steps.length - 1) {
          runStep(i + 1);
        } else {
          completeTimer = setTimeout(() => onCompleteRef.current?.(), COMPLETE_DELAY_MS);
        }
      });
    };

    progress.setValue(0);
    runStep(0);

    return () => {
      cancelled = true;
      if (completeTimer) clearTimeout(completeTimer);
      progress.stopAnimation();
      progress.removeListener(listenerId);
    };
  }, [progress, steps]);

  // Rotación continua del ícono mientras carga
  useEffect(() => {
    if (isDone) return;
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin, isDone]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const accentColor = isDone ? theme.colors.success : theme.colors.primary;

  return (
    <View style={[containerStyle, style]}>
      <View
        style={trackStyle}
        accessibilityRole="progressbar"
        accessibilityLabel={steps[stepIndex].message}
        accessibilityValue={{ min: 0, max: 100, now: percent }}
      >
        <Animated.View style={[fillStyle, { width: barWidth, backgroundColor: accentColor }]} />
      </View>

      <View style={rowStyle}>
        {isDone ? (
          <Ionicons name="checkmark-circle" size={ICON_SIZE} color={theme.colors.success} />
        ) : (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="sync" size={ICON_SIZE} color={theme.colors.primary} />
          </Animated.View>
        )}

        <Text style={messageStyle} numberOfLines={2}>
          {steps[stepIndex].message}
        </Text>

        <Text style={percentStyle}>{percent}%</Text>
      </View>
    </View>
  );
};

const containerStyle: ViewStyle = {
  width: '100%',
  maxWidth: 280,
};

const trackStyle: ViewStyle = {
  height: BAR_HEIGHT,
  borderRadius: theme.borderRadius.full,
  backgroundColor: theme.colors.infoBg,
  overflow: 'hidden',
};

const fillStyle: ViewStyle = {
  height: '100%',
  borderRadius: theme.borderRadius.full,
};

const rowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: theme.spacing.md,
  gap: theme.spacing.sm,
};

const messageStyle: TextStyle = {
  ...theme.textStyles.label,
  flex: 1,
  color: theme.colors.textSecondary,
};

const percentStyle: TextStyle = {
  ...theme.textStyles.label,
  width: 40,
  textAlign: 'right',
  color: theme.colors.textMuted,
};
