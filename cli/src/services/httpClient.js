import axios from 'axios';
import { normalizePath } from '../utils/validators.js';

/**
 * Crea una instancia de axios configurada con interceptores para:
 * - Inyectar baseURL dinámica y cabecera Authorization: Bearer <token>
 * - Medir el tiempo de respuesta en milisegundos
 * - Capturar códigos 4xx/5xx como respuestas válidas y normalizar errores de red
 */
export function createHttpClient({ getBaseUrl, getToken, timeout = 15000 }) {
  const client = axios.create({
    timeout,
    // Permite recibir 4xx y 5xx en response para renderizarlos con su color y body
    validateStatus: () => true
  });

  client.interceptors.request.use((config) => {
    const baseUrl = getBaseUrl();
    if (baseUrl) {
      config.baseURL = baseUrl;
    }

    const token = getToken?.();
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.metadata = { startTime: performance.now() };
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const startTime = response.config?.metadata?.startTime ?? performance.now();
      response.durationMs = Math.max(0, Math.round(performance.now() - startTime));
      return response;
    },
    (error) => {
      const startTime = error.config?.metadata?.startTime ?? performance.now();
      error.durationMs = Math.max(0, Math.round(performance.now() - startTime));
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Ejecuta una petición HTTP y retorna una estructura uniforme para la UI.
 */
export async function executeRequest(client, { method, path, data }) {
  const upperMethod = String(method || 'GET').toUpperCase();
  const normalizedPath = normalizePath(path);

  try {
    const response = await client.request({
      method: upperMethod,
      url: normalizedPath,
      ...(data !== undefined && (upperMethod === 'POST' || upperMethod === 'PUT')
        ? { data }
        : {})
    });

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText || '',
      headers: response.headers || {},
      data: response.data,
      durationMs: response.durationMs ?? 0,
      networkError: null
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      statusText: null,
      headers: {},
      data: null,
      durationMs: error.durationMs ?? 0,
      networkError: {
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'No se pudo conectar con el servidor'
      }
    };
  }
}
