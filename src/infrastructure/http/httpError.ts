import { isAxiosError } from 'axios';
import { AppError } from '../../domain/common/AppError';

const DOMAIN_MESSAGES: Record<string, string> = {
  'place.not_found': 'El lugar no existe o no te pertenece.',
  'place.invalid': 'Los datos del lugar no son válidos.',
  'city.not_found': 'La ciudad seleccionada no existe. Vuelve a elegirla.',
};

const FIELD_MESSAGES: Record<string, string> = {
  name: 'Revisa el nombre.',
  type: 'Elige un tipo válido.',
  address: 'Revisa la dirección.',
  cityId: 'Elige la ciudad.',
  measurementUnit: 'Elige una unidad válida.',
};

interface ProblemDetailsBody {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

const toFieldName = (key: string): string => {
  const clean = key.replace(/^\$\.?/, '');
  return clean.charAt(0).toLowerCase() + clean.slice(1);
};

export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  if (!isAxiosError(error)) {
    return new AppError('server', 'Ocurrió un error inesperado.');
  }

  if (!error.response) {
    return new AppError(
      'network',
      'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    );
  }

  const { status } = error.response;
  const body = (error.response.data ?? {}) as ProblemDetailsBody;
  const domainMessage = body.title ? DOMAIN_MESSAGES[body.title] : undefined;

  if (status === 401) {
    return new AppError('unauthorized', 'Tu sesión expiró. Inicia sesión de nuevo.');
  }

  if (status === 404) {
    return new AppError('not_found', domainMessage ?? 'No se encontró el recurso.');
  }

  if (status === 400) {
    const fieldErrors: Record<string, string> = {};
    for (const key of Object.keys(body.errors ?? {})) {
      const field = toFieldName(key);
      fieldErrors[field] = FIELD_MESSAGES[field] ?? 'Valor no válido.';
    }
    if (body.title === 'city.not_found') fieldErrors.cityId = DOMAIN_MESSAGES['city.not_found'];

    return new AppError('validation', domainMessage ?? 'Revisa los campos marcados.', fieldErrors);
  }

  return new AppError('server', 'Ocurrió un error en el servidor. Inténtalo más tarde.');
};