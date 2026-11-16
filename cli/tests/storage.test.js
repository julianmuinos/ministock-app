import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  addHistoryEntry,
  loadConfig,
  MAX_HISTORY_ITEMS,
  saveConfig,
  updateConfig
} from '../src/config/storage.js';

const tempDirs = [];

function createTempConfigPath() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mern-cli-test-'));
  tempDirs.push(dir);
  return path.join(dir, '.mern-cli.json');
}

afterEach(() => {
  while (tempDirs.length) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

describe('storage (.mern-cli.json)', () => {
  it('devuelve estado limpio cuando el archivo no existe o está corrupto', () => {
    const configPath = createTempConfigPath();
    assert.deepEqual(loadConfig(configPath), {
      baseUrl: null,
      token: null,
      history: []
    });

    fs.writeFileSync(configPath, '{json-roto', 'utf8');
    assert.deepEqual(loadConfig(configPath), {
      baseUrl: null,
      token: null,
      history: []
    });
  });

  it('guarda y actualiza baseUrl y token conservando campos previos', () => {
    const configPath = createTempConfigPath();
    saveConfig({ baseUrl: 'http://localhost:4000/api' }, configPath);
    const updated = updateConfig({ token: 'abc.def.ghi' }, configPath);

    assert.equal(updated.baseUrl, 'http://localhost:4000/api');
    assert.equal(updated.token, 'abc.def.ghi');
    assert.deepEqual(loadConfig(configPath), updated);
  });

  it('mantiene como máximo las últimas 10 peticiones en el historial', () => {
    const configPath = createTempConfigPath();

    for (let i = 1; i <= 14; i += 1) {
      addHistoryEntry(
        {
          method: 'GET',
          path: `/items/${i}`,
          status: 200,
          durationMs: i * 5,
          timestamp: `2026-11-16T10:00:${String(i).padStart(2, '0')}Z`
        },
        configPath
      );
    }

    const { history } = loadConfig(configPath);
    assert.equal(history.length, MAX_HISTORY_ITEMS);
    assert.equal(history[0].path, '/items/14');
    assert.equal(history[9].path, '/items/5');
  });
});
