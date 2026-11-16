import fs from 'node:fs';
import path from 'node:path';

export const CONFIG_FILENAME = '.mern-cli.json';
export const MAX_HISTORY_ITEMS = 10;

export function getDefaultConfigPath(cwd = process.cwd()) {
  return path.join(cwd, CONFIG_FILENAME);
}

function normalizeConfig(raw) {
  return {
    baseUrl: typeof raw?.baseUrl === 'string' && raw.baseUrl.trim() ? raw.baseUrl.trim() : null,
    token: typeof raw?.token === 'string' && raw.token.trim() ? raw.token.trim() : null,
    history: Array.isArray(raw?.history) ? raw.history.slice(0, MAX_HISTORY_ITEMS) : []
  };
}

/**
 * Carga la configuración local desde .mern-cli.json.
 * Si no existe o contiene JSON corrupto, devuelve estado inicial limpio.
 */
export function loadConfig(configPath = getDefaultConfigPath()) {
  try {
    if (!fs.existsSync(configPath)) {
      return normalizeConfig({});
    }
    const content = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(content);
    return normalizeConfig(parsed);
  } catch {
    return normalizeConfig({});
  }
}

/**
 * Persiste la configuración completa en .mern-cli.json.
 */
export function saveConfig(config, configPath = getDefaultConfigPath()) {
  const normalized = normalizeConfig(config);
  fs.writeFileSync(configPath, JSON.stringify(normalized, null, 2) + '\n', 'utf8');
  return normalized;
}

/**
 * Actualiza parcialmente la configuración persistida.
 */
export function updateConfig(patch, configPath = getDefaultConfigPath()) {
  const current = loadConfig(configPath);
  return saveConfig({ ...current, ...patch }, configPath);
}

/**
 * Registra una petición ejecutada al inicio del historial (máximo 10 entradas).
 */
export function addHistoryEntry(entry, configPath = getDefaultConfigPath()) {
  const current = loadConfig(configPath);
  const record = {
    method: entry.method,
    path: entry.path,
    status: entry.status,
    durationMs: entry.durationMs,
    timestamp: entry.timestamp || new Date().toISOString(),
    ...(entry.body !== undefined ? { body: entry.body } : {})
  };
  const nextHistory = [record, ...current.history].slice(0, MAX_HISTORY_ITEMS);
  return saveConfig({ ...current, history: nextHistory }, configPath);
}
