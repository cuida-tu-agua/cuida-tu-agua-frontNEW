import React, { useEffect, useRef, useState } from 'react';
import { formatVolume, unitSymbol } from '../../../domain/consumption/consumptionFormat';
import { goalInputValue, GoalProgress, monthName, validateGoalInput } from '../../../domain/goals/Goal';
import { MeasurementUnit } from '../../../domain/places/Place';
import { toAppError } from '../../../infrastructure/http/httpError';
import { Banner } from '../common/Banner';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Input } from '../common/Input';

interface GoalDialogProps {
  visible: boolean;
  goal: GoalProgress | null;
  unit: MeasurementUnit;
  /** Sends the goal in liters. Throws on error (the message is shown here). */
  save: (targetLiters: number) => Promise<unknown>;
  onDone: () => void;
  onCancel: () => void;
}

/** HU-023: set or change the goal of the current month, typed in the unit of the place. */
export const GoalDialog: React.FC<GoalDialogProps> = ({ visible, goal, unit, save, onDone, onCancel }) => {
  const [text, setText] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const editing = !!goal?.hasGoal && goal.targetLiters !== null;

  // Every time it OPENS it starts from the current goal (or empty). Only on opening: the goal is reloaded every minute
  // and that must not erase what the user is typing.
  const opened = useRef(false);
  useEffect(() => {
    if (visible && !opened.current) {
      setText(goal?.hasGoal && goal.targetLiters !== null ? goalInputValue(goal.targetLiters, unit) : '');
      setFieldError(undefined);
      setError(null);
    }
    opened.current = visible;
  }, [visible, goal, unit]);

  const submit = async () => {
    if (busy) return;
    const { error: invalid, liters } = validateGoalInput(text, unit);
    if (invalid || liters === null) {
      setFieldError(invalid ?? undefined);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await save(liters);
      onDone();
    } catch (e) {
      setError(toAppError(e).message);
    } finally {
      setBusy(false);
    }
  };

  const month = goal ? monthName(goal.monthStart) : 'este mes';

  return (
    <ConfirmDialog
      visible={visible}
      title={editing ? 'Cambiar la meta' : 'Definir la meta'}
      message={`¿Cuánta agua quieres gastar como máximo en ${month}? ${
        goal ? `Hasta ahora van ${formatVolume(goal.consumedLiters, unit)}.` : ''
      }`.trim()}
      confirmLabel="Guardar meta"
      loading={busy}
      onConfirm={submit}
      onCancel={onCancel}
    >
      <Input
        label={`Meta del mes (${unitSymbol(unit)})`}
        placeholder={unit === 'CUBIC_METERS' ? 'Por ejemplo 12' : unit === 'GALLONS' ? 'Por ejemplo 3.000' : 'Por ejemplo 12.000'}
        value={text}
        onChangeText={(value) => {
          setText(value);
          setFieldError(undefined);
        }}
        keyboardType="numeric"
        error={fieldError}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      {!!error && <Banner tone="error" message={error} />}
    </ConfirmDialog>
  );
};
