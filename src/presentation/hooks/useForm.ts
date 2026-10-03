import { useCallback, useRef, useState } from 'react';

type FieldValue = string | boolean;
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormRules<T> = { [K in keyof T]?: (value: T[K], all: T) => string | undefined };

export const useForm = <T extends Record<string, FieldValue>>(initial: T, rules: FormRules<T>) => {
  const [values, setValuesState] = useState<T>(initial);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const latest = useRef<T>(initial);
  const checked = useRef<Partial<Record<keyof T, boolean>>>({});

  const check = (field: keyof T, all: T): string | undefined => rules[field]?.(all[field], all);

  const setValues = useCallback((next: T) => {
    latest.current = next;
    setValuesState(next);
  }, []);

  const setValue = <K extends keyof T>(field: K, value: T[K]) => {
    const next = { ...latest.current, [field]: value };
    setValues(next);
    setErrors((current) => {
      const updated = { ...current };
      for (const key of Object.keys(next) as (keyof T)[]) {
        if (checked.current[key] || current[key]) updated[key] = check(key, next);
      }
      return updated;
    });
  };

  const blur = (field: keyof T) => {
    const value = latest.current[field];
    if (typeof value === 'string' && value.trim() === '') return; // do not scold an untouched field
    checked.current[field] = true;
    setErrors((current) => ({ ...current, [field]: check(field, latest.current) }));
  };

  const validateAll = (): boolean => {
    const all: FormErrors<T> = {};
    for (const field of Object.keys(latest.current) as (keyof T)[]) {
      all[field] = check(field, latest.current);
      checked.current[field] = true;
    }
    setErrors(all);
    return Object.values(all).every((message) => !message);
  };

  const setServerErrors = (fieldErrors: Record<string, string>) => {
    setErrors((current) => {
      const updated = { ...current };
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (field in latest.current) updated[field as keyof T] = message;
      }
      return updated;
    });
  };

  const hasField = (field: string): boolean => field in latest.current;

  return { values, errors, setValue, blur, validateAll, setServerErrors, setValues, hasField };
};
