export type AppErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'locked'
  | 'rate_limited'
  | 'validation'
  | 'unavailable'
  | 'server';

export interface AppErrorDetails {
  remainingAttempts?: number; // wrong password / wrong code
  lockedUntil?: string; // ISO date: account locked (HU-003)
  retryAfterSeconds?: number; // asked for a code too soon
  unmetRules?: string[]; // weak password: MIN_LENGTH, UPPERCASE, DIGIT, SPECIAL...
}

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly code?: string;
  readonly fieldErrors: Record<string, string>;
  readonly details: AppErrorDetails;

  constructor(
    kind: AppErrorKind,
    message: string,
    fieldErrors: Record<string, string> = {},
    options: { code?: string; details?: AppErrorDetails } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.fieldErrors = fieldErrors;
    this.code = options.code;
    this.details = options.details ?? {};
  }
}
