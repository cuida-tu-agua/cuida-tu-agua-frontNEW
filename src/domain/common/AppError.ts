export type AppErrorKind = 'network' | 'unauthorized' | 'not_found' | 'validation' | 'server';

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly fieldErrors: Record<string, string>;

  constructor(kind: AppErrorKind, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.fieldErrors = fieldErrors;
  }
}