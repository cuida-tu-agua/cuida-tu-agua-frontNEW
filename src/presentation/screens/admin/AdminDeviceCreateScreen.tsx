import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FactoryDevice, MAX_BATCH, normalizeSerial, parseCount } from '../../../domain/admin/AdminDevices';
import { adminDeviceRepository } from '../../../core/di/container';
import { toAppError } from '../../../infrastructure/http/httpError';
import { CredentialsSheet } from '../../components/admin/CredentialsSheet';
import { RequireAdmin } from '../../components/admin/RequireAdmin';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminDeviceCreate'>;

type Mode = 'NEXT' | 'SPECIFIC';

const MODES: { value: Mode; label: string }[] = [
  {
    value: 'NEXT',
    get label() {
      return i18n.t('adminCreate.modeNext');
    },
  },
  {
    value: 'SPECIFIC',
    get label() {
      return i18n.t('adminCreate.modeSpecific');
    },
  },
];

/** Factory registration. The credentials that come back replace the form and are shown ONCE. */
export const AdminDeviceCreateScreen: React.FC<Props> = ({ navigation }) => (
  <RequireAdmin>
    <Create onBack={() => navigation.navigate('AdminDevices')} />
  </RequireAdmin>
);

const Create: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('NEXT');
  const [count, setCount] = useState('1');
  const [serial, setSerial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<FactoryDevice[] | null>(null);

  const submit = async () => {
    setError(null);
    setFieldError(undefined);

    let input: { count?: number; serialNumber?: string };
    if (mode === 'NEXT') {
      const parsed = parseCount(count);
      if (!parsed.ok) return setFieldError(parsed.error);
      input = { count: parsed.count };
    } else {
      const normalized = normalizeSerial(serial);
      if (!normalized) return setFieldError(t('adminCreate.serialInvalid'));
      input = { serialNumber: normalized };
    }

    setSaving(true);
    try {
      setCreated(await adminDeviceRepository.register(input));
    } catch (e) {
      setError(toAppError(e).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer narrow={!created} gap={theme.spacing.lg}>
      <PageHeader webOnly={false} back={{ label: t('adminCreate.backLabel'), onPress: onBack }} title={t('adminCreate.title')} subtitle={t('adminCreate.subtitle')} />

      {created ? (
        <CredentialsSheet devices={created} onFinish={onBack} />
      ) : (
        <Card variant="outlined" style={{ gap: theme.spacing.md }}>
          <Text style={titleStyle}>{t('adminCreate.howMany')}</Text>
          {!!error && <Banner tone="error" message={error} onClose={() => setError(null)} />}

          <SegmentedControl options={MODES} value={mode} onChange={setMode} disabled={saving} />

          {mode === 'NEXT' ? (
            <Input
              label={t('adminCreate.quantity', { max: MAX_BATCH })}
              value={count}
              onChangeText={setCount}
              keyboardType="numeric"
              maxLength={2}
              error={fieldError}
              editable={!saving}
            />
          ) : (
            <Input
              label={t('adminCreate.serial')}
              placeholder="SW-ESP32-000100"
              value={serial}
              onChangeText={setSerial}
              autoCapitalize="characters"
              maxLength={32}
              error={fieldError}
              editable={!saving}
            />
          )}

          <Text style={hintStyle}>{t('adminCreate.hint')}</Text>

          <View style={buttonsStyle}>
            <Button label={t('adminCreate.cancel')} variant="secondary" size="medium" onPress={onBack} disabled={saving} />
            <Button label={t('adminCreate.register')} size="medium" onPress={() => void submit()} loading={saving} />
          </View>
        </Card>
      )}
    </PageContainer>
  );
};

const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, fontSize: 19, fontWeight: '800', color: theme.colors.textPrimary }));
const hintStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const buttonsStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.md, flexWrap: 'wrap' };
