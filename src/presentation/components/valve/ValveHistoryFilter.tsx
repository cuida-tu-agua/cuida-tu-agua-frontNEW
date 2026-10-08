import React from 'react';
import { View, ViewStyle } from 'react-native';
import { HistoryPreset, PRESET_OPTIONS } from '../../../domain/valve/historyRange';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { SegmentedControl } from '../common/SegmentedControl';

interface Props {
  preset: HistoryPreset;
  from: string;
  to: string;
  /** Validation message for the custom range. */
  error: string | null;
  onPresetChange: (preset: HistoryPreset) => void;
  onFromChange: (text: string) => void;
  onToChange: (text: string) => void;
  onApply: () => void;
}

/** HU-022: quick ranges plus a from/to range typed as AAAA-MM-DD. */
export const ValveHistoryFilter: React.FC<Props> = ({
  preset,
  from,
  to,
  error,
  onPresetChange,
  onFromChange,
  onToChange,
  onApply,
}) => (
  <View>
    <SegmentedControl label="Periodo" options={PRESET_OPTIONS} value={preset} onChange={onPresetChange} />
    {preset === 'CUSTOM' && (
      <View style={customStyle}>
        <Input label="Desde" placeholder="AAAA-MM-DD" value={from} onChangeText={onFromChange} keyboardType="numeric" maxLength={10} />
        <Input label="Hasta" placeholder="AAAA-MM-DD" value={to} onChangeText={onToChange} keyboardType="numeric" maxLength={10} />
        {!!error && <Banner tone="error" message={error} />}
        <Button label="Aplicar" onPress={onApply} variant="secondary" />
      </View>
    )}
  </View>
);

const customStyle: ViewStyle = { marginBottom: 16 };
