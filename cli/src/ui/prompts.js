import * as p from '@clack/prompts';
import editor from '@inquirer/editor';
import ora from 'ora';
import pc from 'picocolors';
import { addHistoryEntry, updateConfig } from '../config/storage.js';
import { executeRequest } from '../services/httpClient.js';
import { decodeTokenStatus, extractToken } from '../services/jwtService.js';
import {
  normalizeBaseUrl,
  normalizePath,
  parseJsonBody,
  validateBaseUrl,
  validateEmail
} from '../utils/validators.js';
import { colorizeStatus, renderJwtStatus, renderResponse } from './responseRenderer.js';

/**
 * Solicita y guarda la URL base si aún no está configurada en .mern-cli.json.
 */
export async function ensureBaseUrl(state, configPath) {
  if (state.baseUrl) return state.baseUrl;

  const input = await p.text({
    message: 'Ingresa la URL base de tu API REST:',
    placeholder: 'http://localhost:4000/api',
    defaultValue: 'http://localhost:4000/api',
    validate: validateBaseUrl
  });

  if (p.isCancel(input)) {
    p.cancel('Configuración cancelada.');
    process.exit(0);
  }

  const baseUrl = normalizeBaseUrl(input);
  const updated = updateConfig({ baseUrl }, configPath);
  state.baseUrl = updated.baseUrl;
  p.log.success(`URL base guardada en .mern-cli.json: ${pc.cyan(baseUrl)}`);
  return baseUrl;
}

/**
 * Ejecuta una petición HTTP con spinner animado, renderiza respuesta y guarda historial.
 */
async function runAndRecordRequest(client, { method, path, data, recordHistory = true }, configPath) {
  const normalizedPath = normalizePath(path);
  const spinner = ora({
    text: `Enviando ${pc.bold(method)} ${pc.cyan(normalizedPath)}...`,
    color: 'cyan'
  }).start();

  const result = await executeRequest(client, { method, path: normalizedPath, data });
  spinner.stop();

  renderResponse(result, { method, path: normalizedPath });

  if (recordHistory && !result.networkError) {
    addHistoryEntry(
      {
        method,
        path: normalizedPath,
        status: result.status,
        durationMs: result.durationMs,
        timestamp: new Date().toISOString(),
        ...(data !== undefined ? { body: data } : {})
      },
      configPath
    );
  }

  return result;
}

/**
 * Flujo de Iniciar sesión / Registrar usuario / Sesión y URL base.
 */
export async function handleAuthFlow(client, state, configPath) {
  const action = await p.select({
    message: 'Gestión de autenticación y sesión:',
    options: [
      { value: 'login', label: 'Iniciar sesión (POST /auth/login)' },
      { value: 'register', label: 'Registrar usuario (POST /auth/register)' },
      { value: 'url', label: 'Cambiar URL base de la API' },
      { value: 'logout', label: 'Cerrar sesión (eliminar token local)' },
      { value: 'back', label: 'Volver al menú principal' }
    ]
  });

  if (p.isCancel(action) || action === 'back') return;

  if (action === 'url') {
    const newUrl = await p.text({
      message: 'Nueva URL base de la API:',
      initialValue: state.baseUrl || 'http://localhost:4000/api',
      validate: validateBaseUrl
    });
    if (p.isCancel(newUrl)) return;
    const baseUrl = normalizeBaseUrl(newUrl);
    updateConfig({ baseUrl }, configPath);
    state.baseUrl = baseUrl;
    p.log.success(`URL base actualizada a ${pc.cyan(baseUrl)}`);
    return;
  }

  if (action === 'logout') {
    updateConfig({ token: null }, configPath);
    state.token = null;
    p.log.info('Token JWT eliminado de memoria y de .mern-cli.json.');
    return;
  }

  let name;
  if (action === 'register') {
    name = await p.text({
      message: 'Nombre (opcional, presiona Enter para omitir):',
      placeholder: 'Ej. Ada Lovelace'
    });
    if (p.isCancel(name)) return;
  }

  const email = await p.text({
    message: 'Email:',
    placeholder: 'usuario@ejemplo.com',
    validate: validateEmail
  });
  if (p.isCancel(email)) return;

  const userPassword = await p.password({
    message: 'Contraseña:',
    mask: '*',
    validate: (val) => (!val ? 'La contraseña es obligatoria' : undefined)
  });
  if (p.isCancel(userPassword)) return;

  const endpoint = action === 'login' ? '/auth/login' : '/auth/register';
  const payload = {
    ...(name && name.trim() ? { name: name.trim() } : {}),
    email: email.trim(),
    password: userPassword
  };

  const result = await runAndRecordRequest(
    client,
    { method: 'POST', path: endpoint, data: payload },
    configPath
  );

  if (result.ok) {
    const token = extractToken(result.data);
    if (token) {
      updateConfig({ token }, configPath);
      state.token = token;
      p.log.success(
        'JWT capturado y guardado. Se enviará automáticamente en la cabecera Authorization: Bearer.'
      );
    } else if (action === 'login') {
      p.log.warn(
        'La petición fue exitosa, pero no se encontró un campo token/accessToken/jwt en la respuesta.'
      );
    }
  }
}

/**
 * Solicita un body JSON válido (inline o mediante editor externo) validado con JSON.parse().
 */
async function promptJsonBody() {
  const mode = await p.select({
    message: '¿Cómo deseas ingresar el body JSON?',
    options: [
      { value: 'inline', label: 'Escribir JSON en una línea (inline)' },
      { value: 'editor', label: 'Abrir editor de texto (multilínea)' }
    ]
  });

  if (p.isCancel(mode)) return { cancelled: true };

  if (mode === 'inline') {
    const raw = await p.text({
      message: 'Body JSON:',
      placeholder: '{"nombre":"Teclado","precio":15000}',
      validate: (val) => {
        const parsed = parseJsonBody(val);
        return parsed.ok ? undefined : parsed.error;
      }
    });
    if (p.isCancel(raw)) return { cancelled: true };
    return { cancelled: false, data: JSON.parse(raw) };
  }

  let draft = '{\n  \n}';
  while (true) {
    let edited;
    try {
      edited = await editor({
        message: 'Edita el cuerpo JSON, guarda y cierra el editor para continuar:',
        default: draft,
        postfix: '.json'
      });
    } catch {
      return { cancelled: true };
    }

    const parsed = parseJsonBody(edited);
    if (parsed.ok) {
      return { cancelled: false, data: parsed.data };
    }

    p.log.error(parsed.error);
    draft = edited;

    const retry = await p.confirm({
      message: '¿Deseas volver a editar el JSON?'
    });
    if (p.isCancel(retry) || !retry) {
      return { cancelled: true };
    }
  }
}

/**
 * Constructor interactivo de peticiones HTTP (GET, POST, PUT, DELETE).
 */
export async function handleCustomRequestFlow(client, configPath) {
  const method = await p.select({
    message: 'Selecciona el método HTTP:',
    options: [
      { value: 'GET', label: `${pc.green('GET')}     Consultar recursos` },
      { value: 'POST', label: `${pc.cyan('POST')}    Crear recurso (con body JSON)` },
      { value: 'PUT', label: `${pc.yellow('PUT')}     Actualizar recurso (con body JSON)` },
      { value: 'DELETE', label: `${pc.red('DELETE')}  Eliminar recurso` }
    ]
  });
  if (p.isCancel(method)) return;

  const route = await p.text({
    message: 'Ruta relativa (ej. /productos o /usuarios/64ab3...):',
    placeholder: '/products',
    validate: (val) => (!val || !val.trim() ? 'Ingresa una ruta relativa' : undefined)
  });
  if (p.isCancel(route)) return;

  let body;
  if (method === 'POST' || method === 'PUT') {
    const bodyResult = await promptJsonBody();
    if (bodyResult.cancelled) return;
    body = bodyResult.data;
  }

  await runAndRecordRequest(client, { method, path: route, data: body }, configPath);
}

/**
 * Muestra las últimas 10 peticiones y permite re-ejecutar cualquiera con Enter.
 */
export async function handleHistoryFlow(client, loadLatestConfig, configPath) {
  const { history } = loadLatestConfig();

  if (!history.length) {
    p.log.info('Todavía no hay peticiones registradas en el historial.');
    return;
  }

  const selectedIndex = await p.select({
    message: 'Historial reciente (presiona Enter sobre una petición para re-ejecutarla):',
    options: [
      ...history.map((item, idx) => {
        const dateStr = new Date(item.timestamp).toLocaleString();
        const statusStr = colorizeStatus(item.status);
        const bodyTag = item.body !== undefined ? pc.dim(' [JSON]') : '';
        return {
          value: idx,
          label: `${pc.bold(item.method.padEnd(6))} ${item.path}  ${statusStr} ${pc.dim(
            `(${item.durationMs} ms) · ${dateStr}`
          )}${bodyTag}`
        };
      }),
      { value: -1, label: pc.dim('Volver al menú principal') }
    ]
  });

  if (p.isCancel(selectedIndex) || selectedIndex === -1) return;

  const target = history[selectedIndex];
  await runAndRecordRequest(
    client,
    {
      method: target.method,
      path: target.path,
      data: target.body
    },
    configPath
  );
}

/**
 * Muestra el estado decodificado del Token JWT actual y su tiempo restante.
 */
export function handleJwtStatusFlow(state) {
  const status = decodeTokenStatus(state.token);
  console.log('');
  renderJwtStatus(status);
  console.log('');
}
