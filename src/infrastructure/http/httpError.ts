import { isAxiosError } from 'axios';
import { AppError, AppErrorDetails, AppErrorKind } from '../../domain/common/AppError';
import i18n from '../../i18n';
import { describeRules } from '../../domain/auth/passwordPolicy';

/** Problem Details codes look like "auth.account_locked"; dictionary keys cannot hold dots, so the dot becomes "_". */
const codeKey = (code: string): string => `errors.code.${code.replace(/\./g, '_')}`;

const hasMessage = (code: string | undefined): code is string => !!code && i18n.exists(codeKey(code));

const messageOf = (code: string): string => i18n.t(codeKey(code));


/** Which form field shows the error, for errors that belong to ONE field. */
const FIELD_OF_CODE: Record<string, string> = {
  'city.not_found': 'cityId',
  'device.pairing_failed': 'pairingCode',
  'auth.email_not_found': 'email',
  'auth.wrong_password': 'password',
  'auth.email_already_registered': 'email',
  'auth.phone_already_registered': 'phone',
  'auth.invalid_code': 'code',
  'valve.code_required': 'code',
  'auth.code_expired': 'code',
  'auth.account_not_found': 'identifier',
  'user.weak_password': 'password',
  'user.invalid_email': 'email',
  'user.current_password_incorrect': 'currentPassword',
};

/** Message for a field of the 400 "errors" map (ASP.NET ValidationProblemDetails and ms-iam @Valid). */
const fieldMessage = (field: string): string =>
  i18n.exists(`errors.field.${field}`) ? i18n.t(`errors.field.${field}`) : i18n.t('errors.invalidValue');


const KIND_BY_STATUS: Record<number, AppErrorKind> = {
  400: 'validation',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  423: 'locked',
  429: 'rate_limited',
  503: 'unavailable',
};

interface ProblemDetailsBody extends AppErrorDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[] | string>;
}

const toFieldName = (key: string): string => {
  const clean = key.replace(/^\$\.?/, '');
  return clean.charAt(0).toLowerCase() + clean.slice(1);
};

const attempts = (n: number) => i18n.t('errors.attempts', { count: n });

/** 840 → "14 min", 30 → "1 min" (never "0 min"). */
const waitText = (seconds: number) => i18n.t('errors.minutes', { count: Math.max(1, Math.ceil(seconds / 60)) });

/** Adds the useful numbers to the base message (attempts left, missing password rules...). */
const withDetails = (
  code: string | undefined,
  base: string,
  body: ProblemDetailsBody,
  retryAfterSeconds: number | undefined,
): string => {
  if ((code === 'auth.wrong_password' || code === 'auth.invalid_code') && typeof body.remainingAttempts === 'number') {
    return `${base} ${attempts(body.remainingAttempts)}`;
  }
  if (code === 'user.weak_password' && body.unmetRules?.length) {
    return i18n.t('errors.weakPassword', { rules: describeRules(body.unmetRules) });
  }
  if ((code === 'device.pairing_locked' || code === 'device.too_many_attempts') && retryAfterSeconds) {
    return `${base} ${i18n.t('errors.retryIn', { wait: waitText(retryAfterSeconds) })}`;
  }
  return base;
};

const fallbackFor = (kind: AppErrorKind): string => i18n.t(`errors.kind.${kind}`);


export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  if (!isAxiosError(error)) {
    return new AppError('server', i18n.t('errors.unexpected'));
  }

  if (!error.response) {
    return new AppError('network', fallbackFor('network'));
  }

  const { status } = error.response;
  const body = (error.response.data && typeof error.response.data === 'object'
    ? error.response.data
    : {}) as ProblemDetailsBody;
  const kind = KIND_BY_STATUS[status] ?? 'server';
  const code = hasMessage(body.title) ? body.title : undefined;
  const retryAfterSeconds = body.retryAfterSeconds ?? parseRetryAfter(error.response.headers?.['retry-after']);
  const message = withDetails(code, code ? messageOf(code) : fallbackFor(kind), body, retryAfterSeconds);

  const fieldErrors: Record<string, string> = {};
  if (kind === 'validation') {
    for (const key of Object.keys(body.errors ?? {})) {
      const field = toFieldName(key);
      fieldErrors[field] = fieldMessage(field);
    }
  }
  if (code && FIELD_OF_CODE[code]) fieldErrors[FIELD_OF_CODE[code]] = message;

  const details: AppErrorDetails = {
    remainingAttempts: body.remainingAttempts,
    lockedUntil: body.lockedUntil,
    unmetRules: body.unmetRules,
    retryAfterSeconds,
  };

  return new AppError(kind, message, fieldErrors, { code: body.title, details });
};

/** The message of a Problem Details code that did not come in an HTTP answer (e.g. "google_error" in a URL). */
export const messageForCode = (code: string): string => hasMessage(code) ? messageOf(code) : fallbackFor('server');

const parseRetryAfter = (value: unknown): number | undefined => {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
};
