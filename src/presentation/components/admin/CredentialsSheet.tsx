import React, { useState } from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FactoryDevice, credentialsCsv, qrPayload, secretsPy, setupPassword } from '../../../domain/admin/AdminDevices';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { canUseBrowserActions, copyText, downloadTextFile, printLabels } from '../../utils/browserActions';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Checkbox } from '../common/Checkbox';
import { Input } from '../common/Input';
import { QrCode } from '../common/QrCode';

interface CredentialsSheetProps {
  devices: FactoryDevice[];
  /** Pressed once the administrator confirms they saved the sheet. */
  onFinish: () => void;
  finishLabel?: string;
}

/**
 * The credentials of the devices that were just registered (or renewed): QR + serial + pairing code + firmware token.
 * They are shown ONCE (the server keeps only hashes), so leaving is blocked until the administrator says they saved them.
 */
export const CredentialsSheet: React.FC<CredentialsSheetProps> = ({ devices, onFinish, finishLabel }) => {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);
  const [broker, setBroker] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const web = canUseBrowserActions();

  const say = (message: string) => setNotice(message);

  const copy = async (device: FactoryDevice) => say((await copyText(device.authToken)) ? t('credentials.tokenCopied', { serial: device.serialNumber }) : t('credentials.copyFailed'));
  const download = (name: string, content: string, mime?: string) =>
    say(downloadTextFile(name, content, mime) ? t('credentials.downloaded', { name }) : t('credentials.downloadWebOnly'));
  const print = async () => say((await printLabels(devices)) ? t('credentials.printOpened') : t('credentials.printFailed'));

  return (
    <Card variant="outlined" style={cardStyle}>
      <Text style={titleStyle} accessibilityRole="header">
        {devices.length === 1 ? t('credentials.titleOne', { serial: devices[0].serialNumber }) : t('credentials.titleMany', { count: devices.length })}
      </Text>

      <Banner
        tone="warning"
        title={t('credentials.onceTitle')}
        message={t('credentials.onceMessage')}
      />
      {!web && <Banner tone="info" message={t('credentials.webOnly')} />}
      {!!notice && <Banner tone="success" message={notice} onClose={() => setNotice(null)} />}

      <View style={toolbarStyle}>
        <Button
          label={t('credentials.download')}
          size="small"
          icon={<Ionicons name="download-outline" size={18} color={theme.colors.textOnPrimary} />}
          onPress={() => download(t('credentials.sheetFile'), credentialsCsv(devices), 'text/csv')}
        />
        <Button label={t('credentials.print')} size="small" variant="secondary" icon={<Ionicons name="print-outline" size={18} color={theme.colors.primary} />} onPress={() => void print()} />
        <Input
          label={t('credentials.brokerLabel')}
          placeholder="192.168.1.20"
          value={broker}
          onChangeText={setBroker}
          autoCapitalize="none"
          style={brokerStyle}
        />
      </View>

      {devices.map((device) => (
        <View key={device.id} style={rowStyle}>
          <QrCode value={qrPayload(device)} size={96} color={theme.colors.textPrimary} background={theme.colors.surface} />
          <View style={rowTextStyle}>
            <Text style={serialStyle} selectable>
              {device.serialNumber}
            </Text>
            <Text style={detailStyle} selectable>
              {t('credentials.code')} <Text style={monoStyle}>{device.pairingCode}</Text> · {t('credentials.setupWifi')} <Text style={monoStyle}>{setupPassword(device)}</Text>
            </Text>
            <Text style={tokenStyle} selectable>
              {device.authToken}
            </Text>
          </View>
          <View style={rowActionsStyle}>
            <TouchableOpacity onPress={() => void copy(device)} style={actionStyle} accessibilityRole="button" accessibilityLabel={t('credentials.copyTokenA11y', { serial: device.serialNumber })}>
              <Ionicons name="copy-outline" size={16} color={theme.colors.primary} />
              <Text style={actionTextStyle}>{t('credentials.copyToken')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => download('secrets.py', secretsPy(device, broker))}
              style={actionStyle}
              accessibilityRole="button"
              accessibilityLabel={t('credentials.secretsA11y', { serial: device.serialNumber })}
            >
              <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
              <Text style={actionTextStyle}>secrets.py</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={footerStyle}>
        <View style={{ flex: 1, minWidth: 240 }}>
          <Checkbox checked={saved} onChange={setSaved}>
            <Text style={confirmStyle}>{t('credentials.saved')}</Text>
          </Checkbox>
        </View>
        <Button label={finishLabel ?? t('credentials.finish')} size="medium" disabled={!saved} onPress={onFinish} />
      </View>
    </Card>
  );
};

const cardStyle: ViewStyle = { gap: theme.spacing.md };
const confirmStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, color: theme.colors.textPrimary }));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, fontSize: 21, color: theme.colors.textPrimary }));
const toolbarStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: theme.spacing.md };
const brokerStyle: ViewStyle = { minWidth: 220, marginBottom: 0 };
const rowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing.lg,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.medium,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
}));
const rowTextStyle: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 260, gap: 4 };
const rowActionsStyle: ViewStyle = { gap: theme.spacing.sm };
const serialStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, fontSize: 16, color: theme.colors.textPrimary }));
const detailStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const monoStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, fontSize: 13, letterSpacing: 0.5, color: theme.colors.textPrimary }));
const tokenStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, fontSize: 13, letterSpacing: 0.3, color: theme.colors.primary }));
const actionStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32 };
const actionTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.primary }));
const footerStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md };
