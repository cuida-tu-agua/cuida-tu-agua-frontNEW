import React, { useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { toAppError } from '../../../infrastructure/http/httpError';
import { CodeSent } from '../../../domain/valve/Valve';
import { formatCountdown, useCountdown } from '../../hooks/useCountdown';
import { theme } from '../../styles/theme';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { CodeInput } from '../common/CodeInput';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { themed } from '../../styles/themeRuntime';
import { useTranslation } from 'react-i18next';

interface CloseValveDialogProps {
  visible: boolean;
  placeName: string;
  requestCode: () => Promise<CodeSent>;
  confirm: (code: string) => Promise<unknown>;
  onDone: () => void;
  onCancel: () => void;
}

const RESEND_SECONDS = 60;

export const CloseValveDialog: React.FC<CloseValveDialogProps> = ({
  visible,
  placeName,
  requestCode,
  confirm,
  onDone,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [sent, setSent] = useState<CodeSent | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | undefined>(undefined);
  const resend = useCountdown();

  const reset = () => {
    setSent(null);
    setCode('');
    setError(null);
    setCodeError(undefined);
  };
  const cancel = () => {
    reset();
    onCancel();
  };

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      setSent(await requestCode());
      resend.start(RESEND_SECONDS);
    } catch (e) {
      const appError = toAppError(e);
      if (appError.code === 'auth.code_recently_sent') {
        setSent((s) => s ?? { maskedEmail: t('valve.dialog.yourEmail'), expiresAt: '' });
        resend.start(appError.details.retryAfterSeconds ?? RESEND_SECONDS);
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
      await confirm(value);
      reset();
      onDone();
    } catch (e) {
      const appError = toAppError(e);
      if (appError.fieldErrors.code) {
        setCodeError(appError.fieldErrors.code);
        setCode('');
      } else if (appError.kind === 'conflict') {
        setSent(null);
        setCode('');
        setError(appError.message);
      } else {
        setError(appError.message); // no internet... the same code can be tried again
      }
    } finally {
      setBusy(false);
    }
  };

  if (!sent) {
    return (
      <ConfirmDialog
        visible={visible}
        tone="danger"
        title={t('valve.dialog.askTitle')}
        message={t('valve.dialog.askBody', { name: placeName })}
        confirmLabel={t('valve.dialog.sendCode')}
        cancelLabel={t('valve.dialog.keepOpen')}
        loading={busy}
        onConfirm={sendCode}
        onCancel={cancel}
      >
        {!!error && <Banner tone="error" message={error} />}
      </ConfirmDialog>
    );
  }

  return (
    <ConfirmDialog
      visible={visible}
      tone="danger"
      title={t('valve.dialog.codeTitle')}
      message={t('valve.dialog.codeBody', { email: sent.maskedEmail })}
      confirmLabel={t('valve.dialog.closeWater')}
      cancelLabel={t('common.cancel')}
      loading={busy}
      confirmDisabled={code.length !== 6}
      onConfirm={() => submit()}
      onCancel={cancel}
    >
      <CodeInput value={code} onChange={setCode} onComplete={submit} error={codeError} editable={!busy} />
      {!!error && <Banner tone="error" message={error} />}
      {resend.secondsLeft > 0 ? (
        <Text style={hintStyle}>{t('valve.dialog.resendIn', { time: formatCountdown(resend.secondsLeft) })}</Text>
      ) : (
        <Button label={t('valve.dialog.resend')} variant="ghost" size="small" onPress={sendCode} disabled={busy} />
      )}
    </ConfirmDialog>
  );
};

const hintStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  textAlign: 'center',
  marginBottom: theme.spacing.md,
}));
