import { jwtDecode } from 'jwt-decode';

/**
 * Extrae el JWT desde formatos habituales de respuesta en APIs Node/Express.
 */
export function extractToken(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const candidate =
    payload.token ||
    payload.accessToken ||
    payload.jwt ||
    payload.data?.token ||
    payload.data?.accessToken ||
    null;
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
}

/**
 * Formatea una diferencia de milisegundos en una cadena legible (ej. "1h 23m 45s").
 */
export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(Math.abs(ms) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

/**
 * Decodifica el JWT localmente y calcula su estado de vigencia respecto a nowMs.
 */
export function decodeTokenStatus(token, nowMs = Date.now()) {
  if (!token) {
    return {
      hasToken: false,
      valid: false,
      isExpired: false,
      header: null,
      payload: null,
      issuedAt: null,
      expiresAt: null,
      remainingMs: null,
      remainingText: 'Sin sesión iniciada'
    };
  }

  try {
    const header = jwtDecode(token, { header: true });
    const payload = jwtDecode(token);
    const issuedAt = typeof payload.iat === 'number' ? new Date(payload.iat * 1000) : null;
    const expiresAt = typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null;

    if (!expiresAt) {
      return {
        hasToken: true,
        valid: true,
        isExpired: false,
        header,
        payload,
        issuedAt,
        expiresAt: null,
        remainingMs: null,
        remainingText: 'Sin expiración definida (no incluye claim exp)'
      };
    }

    const remainingMs = expiresAt.getTime() - nowMs;
    const isExpired = remainingMs <= 0;
    const remainingText = isExpired
      ? `Expirado hace ${formatDuration(remainingMs)}`
      : `${formatDuration(remainingMs)} restantes`;

    return {
      hasToken: true,
      valid: true,
      isExpired,
      header,
      payload,
      issuedAt,
      expiresAt,
      remainingMs,
      remainingText
    };
  } catch (err) {
    return {
      hasToken: true,
      valid: false,
      isExpired: false,
      header: null,
      payload: null,
      issuedAt: null,
      expiresAt: null,
      remainingMs: null,
      remainingText: 'Token malformado o ilegible',
      error: err.message
    };
  }
}
