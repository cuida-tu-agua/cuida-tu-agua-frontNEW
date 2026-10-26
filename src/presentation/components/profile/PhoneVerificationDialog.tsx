import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User } from '../../../domain/entities/User';
import {
  DIAL_CODES,
  PHONE_CHANNELS,
  PHONE_CHANNEL_LABELS,
  PHONE_COUNTRIES,
  PHONE_COUNTRY_LABELS,
  PhoneChannel,
  PhoneCodeSent,
  PhoneCountry,
  countryOf,
  nationalMobile,
  nationalPartOf,
  validateMobile,
} from '../../../domain/phone/PhoneVerification';
import { toAppError } from '../../../infrastructure/http/httpError';
import { formatCountdown, useCountdown } from '../../hooks/useCountdown';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { CodeInput } from '../common/CodeInput';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Input } from '../common/Input';
import { SegmentedControl } from '../common/SegmentedControl';

interface PhoneVerificationDialogProps {
  visible: boolean;
  user: User;
  requestCode: (country: PhoneCountry, phone: string, channel: PhoneChannel) => Promise<PhoneCodeSent>;
  confirm: (code: string) => Promise<User>;
  /** The phone is verified: the new profile (with phoneVerified and phoneChannel). */
  onDone: (user: User) => void;
  onCancel: () => void;
  /** The modes that can really arrive here (ms-notification). Missing = both. */
  channels?: PhoneChannel[];
}

const RESEND_SECONDS = 60;

/**
 * HU-028: the user picks the country, types the mobile and chooses SMS or WhatsApp. The code travels by THAT mode, and
 * the dialog says so in writing: the critical alerts will keep using it. A number that does not work for the mode is
 * refused (phone.not_reachable), so it can never be verified with it.
 */
export const PhoneVerificationDialog: React.FC<PhoneVerificationDialogProps> = ({
  visible,
  user,
  requestCode,
  confirm,
  onDone,
  onCancel,
  channels,
}) => {
  const { t } = useTranslation();
  const [country, setCountry] = useState<PhoneCountry>(countryOf(user.phone));
  const [phone, setPhone] = useState(nationalPartOf(user.phone));
  const offered = useMemo(() => (channels?.length ? PHONE_CHANNELS.filter((c) => channels.includes(c)) : PHONE_CHANNELS), [channels]);
  const [channel, setChannel] = useState<PhoneChannel>(user.phoneChannel ?? 'WHATSAPP');
  // A mode that cannot arrive here (no SMS configured) is never the one used
  const selected = offered.includes(channel) ? channel : offered[0];
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState<PhoneCodeSent | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const resend = useCountdown();

  // Every time it OPENS it starts from the saved phone and mode (not on every new profile while it is open)
  const opened = useRef(false);
  useEffect(() => {
    if (visible && !opened.current) {
      setCountry(countryOf(user.phone));
      setPhone(nationalPartOf(user.phone));
      setChannel(user.phoneChannel ?? 'WHATSAPP');
      setSent(null);
      setCode('');
      setPhoneError(undefined);
      setCodeError(undefined);
      setError(null);
    }
    opened.current = visible;
  }, [visible, user.phone, user.phoneChannel]);

  const sendCode = async () => {
    if (busy) return;
    const invalid = validateMobile(country, phone);
    if (invalid) {
      setPhoneError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    setPhoneError(undefined);
    try {
      setSent(await requestCode(country, nationalMobile(country, phone)!, selected));
      setCode('');
      resend.start(RESEND_SECONDS);
    } catch (e) {
      const appError = toAppError(e);
      if (appError.code === 'auth.code_recently_sent') {
        resend.start(appError.details.retryAfterSeconds ?? RESEND_SECONDS);
        setError(appError.message);
      } else if (appError.fieldErrors.phone) {
        setPhoneError(appError.fieldErrors.phone);   // taken by another account, or not reachable by this mode
        setSent(null);
      } else {
        setError(appError.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const submit = async (value = code) => {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    setCodeError(undefined);
    try {
      onDone(await confirm(value));
    } catch (e) {
      const appError = toAppError(e);
      if (appError.fieldErrors.code) {
        setCodeError(appError.fieldErrors.code);
        setCode('');
      } else {
        setError(appError.message);
      }
    } finally {
      setBusy(false);
    }
  };

  if (!sent) {
    return (
      <ConfirmDialog
        visible={visible}
        title={user.phoneVerified ? t('phone.changeTitle') : t('phone.verifyTitle')}
        message={t('phone.intro')}
        confirmLabel={t('phone.sendCode')}
        cancelLabel={t('common.cancel')}
        loading={busy}
        confirmDisabled={resend.secondsLeft > 0}
        onConfirm={sendCode}
        onCancel={onCancel}
      >
        <SegmentedControl
          label={t('phone.countryLabel')}
          options={PHONE_COUNTRIES.map((c) => ({ value: c, label: `${PHONE_COUNTRY_LABELS[c]} (${DIAL_CODES[c]})` }))}
          value={country}
          onChange={(c) => {
            setCountry(c);
            setPhoneError(undefined);
          }}
          disabled={busy}
        />
        <Input
          label={t('phone.numberLabel', { code: DIAL_CODES[country] })}
          placeholder={t(`phone.placeholder.${country}`)}
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setPhoneError(undefined);
          }}
          keyboardType="phone-pad"
          maxLength={20}
          error={phoneError}
          editable={!busy}
        />
        <SegmentedControl
          label={t('phone.channelLabel')}
          options={offered.map((c) => ({ value: c, label: PHONE_CHANNEL_LABELS[c] }))}
          value={selected}
          onChange={setChannel}
          disabled={busy}
        />
        <Banner tone="info" message={t('phone.channelNotice', { channel: PHONE_CHANNEL_LABELS[selected] })} />
        {!!error && <Banner tone="error" message={error} />}
        {resend.secondsLeft > 0 && (
          <Text style={hintStyle}>{t('phone.resendIn', { time: formatCountdown(resend.secondsLeft) })}</Text>
        )}
      </ConfirmDialog>
    );
  }

  return (
    <ConfirmDialog
      visible={visible}
      title={t('phone.codeTitle')}
      message={t('phone.codeBody', { channel: PHONE_CHANNEL_LABELS[sent.channel], phone: sent.maskedPhone })}
      confirmLabel={t('phone.verify')}
      cancelLabel={t('common.cancel')}
      loading={busy}
      confirmDisabled={code.length !== 6}
      onConfirm={() => submit()}
      onCancel={onCancel}
    >
      <CodeInput value={code} onChange={setCode} onComplete={submit} error={codeError} editable={!busy} />
      {!!error && <Banner tone="error" message={error} />}
      {resend.secondsLeft > 0 ? (
        <Text style={hintStyle}>{t('phone.resendIn', { time: formatCountdown(resend.secondsLeft) })}</Text>
      ) : (
        <Button label={t('phone.resend')} variant="ghost" size="small" onPress={sendCode} disabled={busy} />
      )}
      <Button label={t('phone.changeNumber')} variant="ghost" size="small" onPress={() => setSent(null)} disabled={busy} />
    </ConfirmDialog>
  );
};

const hintStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  textAlign: 'center',
  marginBottom: theme.spacing.md,
}));
