import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Language } from '../../../i18n/languages';
import { useLanguage } from '../../../i18n/LanguageProvider';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { SegmentedControl } from '../common/SegmentedControl';

/** Each language is written in its own language, so someone who cannot read the current one still finds theirs. */
const OPTIONS: { value: Language; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

/** Language selector of the profile: the change is immediate and remembered on the device. */
export const LanguageSection: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <>
      <SegmentedControl label={t('language.label')} options={OPTIONS} value={language} onChange={setLanguage} />
      <Text style={hintStyle}>{t('language.hint')}</Text>
    </>
  );
};

const hintStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  marginTop: -theme.spacing.sm,
  marginBottom: theme.spacing.md,
}));
