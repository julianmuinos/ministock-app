#!/usr/bin/env node
import * as p from '@clack/prompts';
import { getDefaultConfigPath, loadConfig } from './config/storage.js';
import { createHttpClient } from './services/httpClient.js';
import { renderBanner } from './ui/banner.js';
import {
  ensureBaseUrl,
  handleAuthFlow,
  handleCustomRequestFlow,
  handleHistoryFlow,
  handleJwtStatusFlow
} from './ui/prompts.js';

async function main() {
  const configPath = getDefaultConfigPath();
  const initial = loadConfig(configPath);

  const state = {
    baseUrl: initial.baseUrl,
    token: initial.token
  };

  const client = createHttpClient({
    getBaseUrl: () => state.baseUrl,
    getToken: () => state.token
  });

  renderBanner(state);
  p.intro('Bienvenido a MERN-CLI-Client');

  await ensureBaseUrl(state, configPath);

  while (true) {
    const choice = await p.select({
      message: 'Menú principal — ¿Qué deseas hacer?',
      options: [
        { value: 'auth', label: 'Iniciar sesión / Registrar usuario' },
        { value: 'request', label: 'Ejecutar petición personalizada (GET, POST, PUT, DELETE)' },
        { value: 'history', label: 'Ver historial de peticiones recientes' },
        { value: 'jwt', label: 'Ver estado del Token JWT actual' },
        { value: 'exit', label: 'Salir' }
      ]
    });

    if (p.isCancel(choice) || choice === 'exit') {
      p.outro('¡Hasta luego!');
      break;
    }

    switch (choice) {
      case 'auth':
        await handleAuthFlow(client, state, configPath);
        break;
      case 'request':
        await handleCustomRequestFlow(client, configPath);
        break;
      case 'history':
        await handleHistoryFlow(client, () => loadConfig(configPath), configPath);
        break;
      case 'jwt':
        handleJwtStatusFlow(state);
        break;
    }
  }
}

main().catch((err) => {
  console.error('Error inesperado en MERN-CLI-Client:', err.message);
  process.exit(1);
});
