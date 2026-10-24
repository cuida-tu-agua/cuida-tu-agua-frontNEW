import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import {
  MessageTemplate,
  ShortMessageProviders,
  TestMessageResult,
  messageDescription,
  messageTitle,
  placeholderLabel,
  renderMessage,
  sampleValues,
  smsCount,
  validateMessage,
} from '../../../domain/messages/MessageTemplate';
import { RequireAdmin } from '../../components/admin/RequireAdmin';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Input } from '../../components/common/Input';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { useAdminMessages } from '../../hooks/useAdminMessages';
import i18n from '../../../i18n';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminMessages'>;

/**
 * The administrator writes the WhatsApp / SMS texts: critical alert, phone code, invitation to collaborate and guest link.
 * Placeholders such as {place} are filled in when each message is sent; the preview shows an example.
 */
export const AdminMessagesScreen: React.FC<Props> = () => (
  <RequireAdmin>
    <Messages />
  </RequireAdmin>
);

const Messages: React.FC = () => {
  const { t } = useTranslation();
  const admin = useAdminMessages();

  return (
    <PageContainer gap={theme.spacing.md}>
      <PageHeader webOnly={false} title={t('messages.title')} subtitle={t('messages.subtitle')} />
      <Banner tone="info" message={t('messages.whatsAppNote')} />
      {!!admin.providers && <Banner tone={admin.providers.whatsApp === 'meta' ? 'success' : 'warning'} message={providersText(admin.providers)} />}
      {!!admin.notice && <Banner tone="success" message={admin.notice} onClose={admin.dismissNotice} />}
      {!!admin.error && (
        <Banner tone="error" message={admin.error.message} action={{ label: t('adminCommon.retry'), onPress: () => void admin.reload() }} onClose={admin.dismissError} />
      )}

      {!admin.templates && admin.loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.xxl }} />
      ) : (
        <View style={listStyle}>
          {(admin.templates ?? []).map((template) => (
            <MessageCard
              key={template.key}
              template={template}
              busy={admin.busyKey === template.key}
              onSave={(body) => admin.save(template.key, body)}
              onReset={() => admin.reset(template.key)}
              testing={admin.testingKey === template.key}
              test={admin.tests[template.key]}
              onTest={() => void admin.sendTest(template.key)}
            />
          ))}
        </View>
      )}
    </PageContainer>
  );
};

interface MessageCardProps {
  template: MessageTemplate;
  busy: boolean;
  onSave: (body: string) => Promise<boolean>;
  onReset: () => Promise<boolean>;
  testing: boolean;
  test?: TestMessageResult;
  onTest: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ template, busy, onSave, onReset, testing, test, onTest }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(template.body);
  const [confirmReset, setConfirmReset] = useState(false);

  // What the server answers (saved or restored) becomes the new starting point
  useEffect(() => setDraft(template.body), [template.body]);

  const changed = draft.trim() !== template.body;
  const problem = validateMessage(template, draft);
  const preview = useMemo(() => renderMessage(draft, sampleValues()), [draft]);
  const segments = smsCount(preview);

  const insert = (token: string) => setDraft((current) => (current.endsWith(' ') || !current ? current : `${current} `) + token);

  return (
    <Card variant="outlined" style={cardStyle}>
      <View style={headerStyle}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={titleStyle}>{messageTitle(template.key)}</Text>
          <Text style={mutedStyle}>{messageDescription(template.key)}</Text>
        </View>
        <View style={[pillStyle, template.isCustom ? customPillStyle : defaultPillStyle]}>
          <Text style={pillTextStyle}>{template.isCustom ? t('messages.custom') : t('messages.default')}</Text>
        </View>
      </View>

      <Input
        label={t('messages.text')}
        value={draft}
        onChangeText={setDraft}
        multiline
        maxLength={template.maxLength}
        error={changed ? problem ?? undefined : undefined}
        hint={t('messages.counter', { count: draft.trim().length, max: template.maxLength })}
      />

      <Text style={labelStyle}>{t('messages.placeholdersTitle')}</Text>
      <View style={chipsStyle}>
        {template.placeholders.map((p) => (
          <TouchableOpacity
            key={p.name}
            style={chipStyle}
            onPress={() => insert(p.token)}
            accessibilityRole="button"
            accessibilityLabel={t('messages.insertA11y', { label: placeholderLabel(p.name) })}
          >
            <Text style={chipTokenStyle}>{p.token}</Text>
            <Text style={chipLabelStyle}>
              {placeholderLabel(p.name)}
              {p.required ? ` · ${t('messages.required')}` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={previewStyle}>
        <View style={previewHeaderStyle}>
          <Ionicons name="logo-whatsapp" size={16} color={theme.colors.success} />
          <Text style={labelStyle}>{t('messages.preview')}</Text>
          <Text style={mutedStyle}>{t('messages.smsCount', { count: segments })}</Text>
        </View>
        <Text style={previewTextStyle} selectable>
          {preview}
        </Text>
      </View>

      <View style={actionsStyle}>
        <Button label={t('messages.save')} size="small" onPress={() => void onSave(draft)} disabled={!changed || !!problem} loading={busy} />
        {changed && <Button label={t('messages.discard')} size="small" variant="secondary" onPress={() => setDraft(template.body)} disabled={busy} />}
        {template.isCustom && !changed && (
          <Button label={t('messages.restore')} size="small" variant="secondary" onPress={() => setConfirmReset(true)} disabled={busy} />
        )}
        {!changed && (
          <Button
            label={t('messages.test')}
            size="small"
            variant="ghost"
            onPress={onTest}
            loading={testing}
            icon={<Ionicons name="paper-plane-outline" size={16} color={theme.colors.primary} />}
          />
        )}
      </View>
      {changed && <Text style={mutedStyle}>{t('messages.testAfterSave')}</Text>}
      {!!test && <Banner tone={test.sent ? 'success' : 'error'} message={testText(test)} />}

      <ConfirmDialog
        visible={confirmReset}
        title={t('messages.restoreTitle')}
        message={t('messages.restoreText', { text: template.defaultBody })}
        confirmLabel={t('messages.restore')}
        loading={busy}
        onConfirm={() => void onReset().finally(() => setConfirmReset(false))}
        onCancel={() => setConfirmReset(false)}
      />
    </Card>
  );
};

/** What the providers mean for the administrator: real WhatsApp (Meta) or simulated in Mailpit. */
const providerLine = (mode: string, provider: string, template = false): string => {
  if (provider === 'meta') return i18n.t(template ? 'messages.providers.metaTemplate' : 'messages.providers.meta');
  if (provider === 'mailpit') return i18n.t('messages.providers.simulated', { mode });
  if (provider === 'twilio') return i18n.t(template ? 'messages.providers.twilioTemplate' : 'messages.providers.twilio', { mode });
  return i18n.t('messages.providers.off', { mode });
};

const providersText = (p: ShortMessageProviders): string =>
  `${providerLine('WhatsApp', p.whatsApp, p.whatsAppTemplate)} ${providerLine('SMS', p.sms)}`;

const testText = (r: TestMessageResult): string => {
  if (r.sent) return i18n.t('messages.testSent', { channel: r.channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS', phone: r.maskedPhone ?? '' });
  const problem = i18n.t(`messages.testProblem.${r.problem ?? 'unavailable'}`);
  return r.detail ? `${problem} ${i18n.t('messages.testDetail', { detail: r.detail })}` : problem;
};

const listStyle: ViewStyle = { gap: theme.spacing.lg };
const cardStyle: ViewStyle = { gap: theme.spacing.md };
const headerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md };
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const labelStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textSecondary }));
const pillStyle: ViewStyle = { paddingHorizontal: theme.spacing.md, paddingVertical: 4, borderRadius: theme.borderRadius.full, borderWidth: 1 };
const customPillStyle: ViewStyle = themed(() => ({ backgroundColor: theme.colors.infoBg, borderColor: theme.colors.info }));
const defaultPillStyle: ViewStyle = themed(() => ({ backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }));
const pillTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textPrimary }));
const chipsStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm };
const chipStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.xs,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: 6,
  borderRadius: theme.borderRadius.full,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  backgroundColor: theme.colors.surface,
}));
const chipTokenStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.primary }));
const chipLabelStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const previewStyle: ViewStyle = themed(() => ({
  gap: theme.spacing.sm,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.colors.successBg,
  borderWidth: 1,
  borderColor: theme.colors.success,
}));
const previewHeaderStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'wrap' };
const previewTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.body, color: theme.colors.textPrimary }));
const actionsStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm };
