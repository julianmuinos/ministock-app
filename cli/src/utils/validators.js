/**
 * Valida que una cadena sea una URL HTTP o HTTPS válida.
 * Retorna mensaje de error para @clack/prompts o undefined si es válida.
 */
export function validateBaseUrl(value) {
  if (!value || !value.trim()) {
    return 'La URL base es obligatoria (ej. http://localhost:4000/api)';
  }
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'La URL debe comenzar con http:// o https://';
    }
    return undefined;
  } catch {
    return 'Ingresa una URL válida (ej. http://localhost:4000/api)';
  }
}

/**
 * Normaliza la URL base eliminando espacios y barras finales redundantes.
 */
export function normalizeBaseUrl(url) {
  return url.trim().replace(/\/+$/, '');
}

/**
 * Normaliza una ruta relativa asegurando una única barra inicial.
 */
export function normalizePath(inputPath) {
  const trimmed = (inputPath || '').trim();
  if (!trimmed) return '/';
  return '/' + trimmed.replace(/^\/+/, '');
}

/**
 * Valida formato básico de correo electrónico.
 */
export function validateEmail(value) {
  if (!value || !value.trim()) {
    return 'El email es obligatorio';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return 'Ingresa un email válido';
  }
  return undefined;
}

/**
 * Parsea un string JSON con JSON.parse() devolviendo resultado estructurado.
 */
export function parseJsonBody(rawText) {
  if (!rawText || !rawText.trim()) {
    return { ok: false, error: 'El body JSON no puede estar vacío' };
  }
  try {
    const data = JSON.parse(rawText);
    if (data === null || typeof data !== 'object') {
      return { ok: false, error: 'El body debe ser un objeto o arreglo JSON válido' };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: `JSON inválido: ${err.message}` };
  }
}
