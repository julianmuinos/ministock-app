import boxen from 'boxen';
import pc from 'picocolors';
import { decodeTokenStatus } from '../services/jwtService.js';

/**
 * Muestra la cabecera de bienvenida y el estado actual de conexión y JWT.
 */
export function renderBanner({ baseUrl, token }) {
  const jwt = decodeTokenStatus(token);

  let authSummary;
  if (!jwt.hasToken) {
    authSummary = pc.yellow('Sin autenticar');
  } else if (!jwt.valid) {
    authSummary = pc.red('Token inválido');
  } else if (jwt.isExpired) {
    authSummary = pc.red(`JWT expirado (${jwt.remainingText})`);
  } else {
    authSummary = pc.green(`JWT activo (${jwt.remainingText})`);
  }

  const content = [
    pc.bold(pc.cyan('MERN-CLI-Client')) + pc.dim(' — Cliente REST interactivo en terminal'),
    `${pc.bold('API Base:')} ${baseUrl ? pc.white(baseUrl) : pc.yellow('Sin configurar')}`,
    `${pc.bold('Sesión:')}   ${authSummary}`
  ].join('\n');

  console.log(
    boxen(content, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
      borderColor: 'cyan',
      borderStyle: 'round'
    })
  );
}
