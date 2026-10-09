import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../common/Logo';
import { useLayout } from '../../layout/breakpoints';
import { useAppTheme } from '../../theme/ThemeProvider';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, onBack, footer, children }) => {
  const insets = useSafeAreaInsets();
  const { isCompact, isExpanded } = useLayout();

  // Web, wide window (Figma): brand panel on the left, the form on the right, no card around it
  if (Platform.OS === 'web' && isExpanded) {
    return (
      <View style={splitStyle}>
        <BrandPanel />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={splitFormScrollStyle} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={splitFormStyle}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={splitBackStyle} accessibilityRole="button" accessibilityLabel="Volver" hitSlop={12}>
                <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            <Text style={splitTitleStyle} accessibilityRole="header">
              {title}
            </Text>
            {!!subtitle && <Text style={splitSubtitleStyle}>{subtitle}</Text>}
            <View style={{ marginTop: theme.spacing.lg }}>{children}</View>
            <View style={{ marginTop: theme.spacing.md }}>{footer}</View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[containerStyle, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[contentStyle, !isCompact && wideContentStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={isCompact ? undefined : formColumnStyle}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={backStyle}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}

        <View style={headerStyle}>
          <Logo type="isotipo" theme="light" size={onBack ? 72 : 110} />
          <Text style={titleStyle} accessibilityRole="header">
            {title}
          </Text>
          {!!subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
        </View>

        <View style={cardStyle}>{children}</View>

        {footer}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const containerStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));

const contentStyle: ViewStyle = {
  flexGrow: 1,
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.xxxl,
};

/** Wide screen: the form stays a narrow card in the middle instead of stretching across the monitor. */
const wideContentStyle: ViewStyle = { alignItems: 'center', justifyContent: 'center' };
const formColumnStyle: ViewStyle = { width: '100%', maxWidth: 460 };

const backStyle: ViewStyle = themed(() => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.surface,
  borderWidth: 1,
  borderColor: theme.colors.border,
}));

const headerStyle: ViewStyle = { alignItems: 'center', marginBottom: theme.spacing.xl };

const titleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.h2,
  color: theme.colors.textPrimary,
  marginTop: theme.spacing.md,
  marginBottom: theme.spacing.sm,
  textAlign: 'center',
}));

const subtitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  fontSize: 16,
  lineHeight: 24,
  color: theme.colors.textSecondary,
  textAlign: 'center',
}));

const cardStyle: ViewStyle = themed(() => ({
  marginBottom: theme.spacing.xl,
  backgroundColor: theme.colors.surface,
  paddingVertical: theme.spacing.xl,
  paddingHorizontal: theme.spacing.lg,
  borderColor: theme.colors.border,
  borderWidth: 0.3,
  borderRadius: theme.spacing.xl,
  shadowColor: theme.colors.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 1,
}));

export const AuthFooterLink: React.FC<{ text: string; link: string; onPress: () => void }> = ({
  text,
  link,
  onPress,
}) => (
  <View style={footerStyle}>
    <Text style={footerTextStyle}>{text} </Text>
    <Text style={footerLinkStyle} onPress={onPress} accessibilityRole="link" suppressHighlighting>
      {link}
    </Text>
  </View>
);

const footerStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' };

const footerTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));

const footerLinkStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.primary,
  fontWeight: '800',
}));

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  { icon: 'water-outline', title: 'Consumo en tiempo real', text: 'Mira cuántos litros usas hoy, esta semana y este mes.' },
  { icon: 'notifications-outline', title: 'Alertas al instante', text: 'Te avisamos si la válvula se cierra o el medidor deja de reportar.' },
  { icon: 'lock-closed-outline', title: 'Cierra el agua a distancia', text: 'Controla la válvula desde el celular o el computador.' },
];

/** Left side of the wide login: what the app is for. Brand color in the light themes, the raised surface in the dark ones. */
const BrandPanel: React.FC = () => {
  const { dark } = useAppTheme();
  const ink = dark ? theme.colors.textPrimary : '#FFFFFF';
  const soft = dark ? theme.colors.textSecondary : 'rgba(255,255,255,0.88)';
  const tile = dark ? theme.colors.infoBg : 'rgba(255,255,255,0.14)';

  return (
    <View style={[panelStyle, { backgroundColor: dark ? theme.colors.surfaceAlt : theme.colors.primaryActive }]}>
      <View style={[panelCircleStyle, { top: -150, right: -130, backgroundColor: tile }]} />
      <View style={[panelCircleStyle, { bottom: -110, left: -90, width: 240, height: 240, borderRadius: 120, backgroundColor: tile }]} />

      <View style={panelBrandStyle}>
        <Logo type="isotipo" theme="light" size={44} mono={ink} />
        <Text style={[panelBrandTextStyle, { color: ink }]}>Cuida Tu Agua</Text>
      </View>

      <View style={panelBodyStyle}>
        <Text style={[panelHeadlineStyle, { color: ink }]}>El agua de tu hogar o negocio, bajo control.</Text>
        {FEATURES.map((feature) => (
          <View key={feature.title} style={featureRowStyle}>
            <View style={[featureIconStyle, { backgroundColor: tile }]}>
              <Ionicons name={feature.icon} size={22} color={ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[featureTitleStyle, { color: ink }]}>{feature.title}</Text>
              <Text style={[featureTextStyle, { color: soft }]}>{feature.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[panelFootStyle, { color: soft }]}>Proyecto SENA · Análisis y Desarrollo de Software</Text>
    </View>
  );
};

const splitStyle: ViewStyle = themed(() => ({ flex: 1, flexDirection: 'row', backgroundColor: theme.colors.surface }));
const panelStyle: ViewStyle = { flex: 1, maxWidth: 640, padding: theme.spacing.xxxl, justifyContent: 'space-between', overflow: 'hidden' };
const panelCircleStyle: ViewStyle = { position: 'absolute', width: 300, height: 300, borderRadius: 150 };
const panelBrandStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const panelBrandTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, fontSize: 22 }));
const panelBodyStyle: ViewStyle = { gap: theme.spacing.lg };
const panelHeadlineStyle: TextStyle = themed(() => ({ ...theme.textStyles.h1, fontSize: 36, lineHeight: 44, maxWidth: 420, marginBottom: theme.spacing.sm }));
const featureRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const featureIconStyle: ViewStyle = { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' };
const featureTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 17, fontWeight: '800' }));
const featureTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15 }));
const panelFootStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 13 }));

const splitFormScrollStyle: ViewStyle = { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xxl };
const splitFormStyle: ViewStyle = { width: '100%', maxWidth: 400 };
const splitBackStyle: ViewStyle = { alignSelf: 'flex-start', marginBottom: theme.spacing.md };
const splitTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h1, fontSize: 30, lineHeight: 38, color: theme.colors.textPrimary }));
const splitSubtitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 16, lineHeight: 24, color: theme.colors.textSecondary, marginTop: theme.spacing.xs }));
