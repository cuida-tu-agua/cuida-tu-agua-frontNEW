import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
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
  { value: 'NEXT', label: 'Los siguientes seriales libres' },
  { value: 'SPECIFIC', label: 'Un serial específico' },
];

/** Factory registration. The credentials that come back replace the form and are shown ONCE. */
export const AdminDeviceCreateScreen: React.FC<Props> = ({ navigation }) => (
  <RequireAdmin>
    <Create onBack={() => navigation.navigate('AdminDevices')} />
  </RequireAdmin>
);

const Create: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
      if (!normalized) return setFieldError('El serial tiene de 4 a 32 letras, números o guiones. Ej.: SW-ESP32-000100.');
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
      <PageHeader webOnly={false} back={{ label: 'Medidores', onPress: onBack }} title="Alta de fábrica" subtitle="Registra medidores nuevos y obtén sus credenciales." />

      {created ? (
        <CredentialsSheet devices={created} onFinish={onBack} />
      ) : (
        <Card variant="outlined" style={{ gap: theme.spacing.md }}>
          <Text style={titleStyle}>¿Cuántos medidores?</Text>
          {!!error && <Banner tone="error" message={error} onClose={() => setError(null)} />}

          <SegmentedControl options={MODES} value={mode} onChange={setMode} disabled={saving} />

          {mode === 'NEXT' ? (
            <Input
              label={`Cantidad (1 a ${MAX_BATCH})`}
              value={count}
              onChangeText={setCount}
              keyboardType="numeric"
              maxLength={2}
              error={fieldError}
              editable={!saving}
            />
          ) : (
            <Input
              label="Serial"
              placeholder="SW-ESP32-000100"
              value={serial}
              onChangeText={setSerial}
              autoCapitalize="characters"
              maxLength={32}
              error={fieldError}
              editable={!saving}
            />
          )}

          <Text style={hintStyle}>Se generan el token del firmware y el código de emparejamiento. Solo se muestran una vez: en la base de datos queda su huella (hash).</Text>

          <View style={buttonsStyle}>
            <Button label="Cancelar" variant="secondary" size="medium" onPress={onBack} disabled={saving} />
            <Button label="Registrar" size="medium" onPress={() => void submit()} loading={saving} />
          </View>
        </Card>
      )}
    </PageContainer>
  );
};

const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, fontSize: 19, fontWeight: '800', color: theme.colors.textPrimary }));
const hintStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const buttonsStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.md, flexWrap: 'wrap' };
