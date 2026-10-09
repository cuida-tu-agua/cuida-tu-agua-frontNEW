import { isAxiosError } from 'axios';
import { AppError, AppErrorDetails, AppErrorKind } from '../../domain/common/AppError';
import { describeRules } from '../../domain/auth/passwordPolicy';

const DOMAIN_MESSAGES: Record<string, string> = {
  // ms-places
  'place.not_found': 'El lugar no existe o no te pertenece.',
  'place.invalid': 'Los datos del lugar no son válidos.',
  'city.not_found': 'La ciudad seleccionada no existe. Vuelve a elegirla.',
  'place.has_active_device': 'Este lugar tiene un medidor vinculado. Desvincúlalo antes de eliminar el lugar.',
  'service.unavailable': 'Un servicio necesario no está respondiendo. Inténtalo en unos minutos.',
  // ms-devices
  'device.invalid': 'Revisa el serial y el código de emparejamiento.',
  'device.pairing_failed': 'El serial o el código de emparejamiento no son correctos.',
  'device.pairing_locked': 'Demasiados intentos fallidos con este medidor.',
  'device.too_many_attempts': 'Hiciste demasiados intentos de vinculación.',
  'device.already_linked': 'Este medidor ya está vinculado a otro lugar. Desvincúlalo allá primero.',
  'place.already_has_device': 'Este lugar ya tiene un medidor vinculado.',
  'device.offline': 'El medidor no se ha conectado todavía. Enciéndelo, espera a que se conecte al WiFi y vuelve a intentarlo.',
  'device.revoked': 'Este medidor fue dado de baja y no se puede vincular.',
  'device.not_linked': 'Este lugar no tiene un medidor vinculado.',
  // ms-consumption
  'consumption.invalid_period': 'Periodo no válido.',
  'consumption.invalid_time_zone': 'La zona horaria del teléfono no es válida.',
  // ms-valve
  'valve.not_found': 'Este lugar no tiene un medidor con válvula.',
  'valve.command_in_progress': 'Ya hay una orden en curso. Espera la confirmación del medidor.',
  'valve.already_in_state': 'La válvula ya está en ese estado.',
  'valve.device_offline': 'El medidor no está conectado, así que la orden no le llegaría. Revisa su energía y el WiFi.',
  'valve.code_required': 'Escribe el código que te enviamos al correo.',
  'valve.command_not_found': 'No encontramos esa orden.',
  // ms-iam: administration
  'auth.admin_required': 'Solo un administrador puede hacer esto.',
  'user.cannot_block_self': 'No puedes bloquear tu propia cuenta.',
  'validation.invalid_filter': 'Revisa la búsqueda o el filtro.',
  // ms-notification
  'notification.not_found': 'Esa notificación ya no existe.',
  'preferences.critical_requires_in_app': 'Las alertas críticas siempre se muestran en la app: no se puede apagar.',
  // ms-iam: login and session
  'auth.email_not_found': 'No encontramos una cuenta con este correo.',
  'auth.wrong_password': 'Contraseña incorrecta.',
  'auth.account_not_verified': 'Tu cuenta aún no está verificada. Confirma tu correo para entrar.',
  'auth.account_locked': 'Bloqueamos tu cuenta por seguridad después de varios intentos fallidos.',
  'auth.account_blocked': 'Tu cuenta fue bloqueada. Comunícate con soporte.',
  'auth.invalid_refresh_token': 'Tu sesión expiró. Inicia sesión de nuevo.',
  'auth.invalid_token': 'Tu sesión expiró. Inicia sesión de nuevo.',
  // ms-iam: registration and codes
  'auth.email_already_registered': 'Este correo ya está registrado.',
  'auth.phone_already_registered': 'Este teléfono ya está registrado en otra cuenta.',
  'auth.already_verified': 'Tu correo ya estaba verificado. Ya puedes iniciar sesión.',
  'auth.invalid_code': 'El código no es correcto.',
  'auth.code_expired': 'El código venció o ya se usó. Pide uno nuevo.',
  'auth.code_recently_sent': 'Acabamos de enviarte un código. Espera un momento antes de pedir otro.',
  'auth.account_not_found': 'No encontramos una cuenta con ese correo o teléfono.',
  // ms-iam: profile
  'user.weak_password': 'La contraseña no cumple los requisitos.',
  'user.invalid_email': 'El correo no es válido.',
  'user.invalid': 'Revisa los datos: hay un valor que no es válido.',
  'user.current_password_incorrect': 'La contraseña actual no es correcta.',
  'user.invalid_avatar': 'La foto debe ser JPG o PNG y pesar máximo 2 MB.',
  'user.not_found': 'Tu cuenta ya no existe.',
  // generic
  'validation.failed': 'Revisa los campos marcados.',
  'validation.malformed_body': 'Los datos enviados no son válidos.',
};

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

/** Messages for the 400 "errors" map (ASP.NET ValidationProblemDetails and ms-iam @Valid). */
const FIELD_MESSAGES: Record<string, string> = {
  name: 'Revisa el nombre.',
  type: 'Elige un tipo válido.',
  address: 'Revisa la dirección.',
  cityId: 'Elige la ciudad.',
  measurementUnit: 'Elige una unidad válida.',
  firstName: 'Revisa tu nombre.',
  lastName: 'Revisa tu apellido.',
  email: 'Revisa el correo.',
  phone: 'Revisa el teléfono.',
  password: 'Revisa la contraseña.',
  newPassword: 'Revisa la contraseña nueva.',
  currentPassword: 'Escribe tu contraseña actual.',
  code: 'Revisa el código.',
  identifier: 'Revisa el correo o teléfono.',
  serialNumber: 'Revisa el serial.',
  pairingCode: 'Revisa el código de emparejamiento.',
};

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

const attempts = (n: number) => (n === 1 ? 'Te queda 1 intento.' : `Te quedan ${n} intentos.`);

/** 840 → "14 min", 30 → "1 min" (never "0 min"). */
const waitText = (seconds: number) => `${Math.max(1, Math.ceil(seconds / 60))} min`;

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
    return `A la contraseña le falta ${describeRules(body.unmetRules)}.`;
  }
  if ((code === 'device.pairing_locked' || code === 'device.too_many_attempts') && retryAfterSeconds) {
    return `${base} Inténtalo de nuevo en ${waitText(retryAfterSeconds)}.`;
  }
  return base;
};

const FALLBACK_BY_KIND: Record<AppErrorKind, string> = {
  network: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  unauthorized: 'Tu sesión expiró. Inicia sesión de nuevo.',
  forbidden: 'No tienes permiso para hacer esto.',
  not_found: 'No se encontró el recurso.',
  conflict: 'Ese dato ya existe.',
  locked: 'La cuenta está bloqueada temporalmente.',
  rate_limited: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  validation: 'Revisa los campos marcados.',
  unavailable: 'El servicio no está disponible. Inténtalo en unos minutos.',
  server: 'Ocurrió un error en el servidor. Inténtalo más tarde.',
};

export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  if (!isAxiosError(error)) {
    return new AppError('server', 'Ocurrió un error inesperado.');
  }

  if (!error.response) {
    return new AppError('network', FALLBACK_BY_KIND.network);
  }

  const { status } = error.response;
  const body = (error.response.data && typeof error.response.data === 'object'
    ? error.response.data
    : {}) as ProblemDetailsBody;
  const kind = KIND_BY_STATUS[status] ?? 'server';
  const code = body.title && DOMAIN_MESSAGES[body.title] ? body.title : undefined;
  const retryAfterSeconds = body.retryAfterSeconds ?? parseRetryAfter(error.response.headers?.['retry-after']);
  const message = withDetails(code, code ? DOMAIN_MESSAGES[code] : FALLBACK_BY_KIND[kind], body, retryAfterSeconds);

  const fieldErrors: Record<string, string> = {};
  if (kind === 'validation') {
    for (const key of Object.keys(body.errors ?? {})) {
      const field = toFieldName(key);
      fieldErrors[field] = FIELD_MESSAGES[field] ?? 'Valor no válido.';
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

const parseRetryAfter = (value: unknown): number | undefined => {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
};
