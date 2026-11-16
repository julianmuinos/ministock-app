import boxen from 'boxen';
import { highlight } from 'cli-highlight';
import Table from 'cli-table3';
import pc from 'picocolors';

const MAX_CELL_LENGTH = 36;

/**
 * Formatea el código de estado HTTP con colores según el rango:
 * 2xx -> verde, 4xx -> amarillo, 5xx -> rojo, 3xx/otros -> cyan.
 */
export function formatStatusBadge(status, statusText = '') {
  const label = statusText ? `${status} ${statusText}` : `${status}`;
  if (status >= 200 && status < 300) {
    return pc.bgGreen(pc.black(` ${label} `));
  }
  if (status >= 400 && status < 500) {
    return pc.bgYellow(pc.black(` ${label} `));
  }
  if (status >= 500) {
    return pc.bgRed(pc.white(` ${label} `));
  }
  return pc.bgCyan(pc.black(` ${label} `));
}

/**
 * Colorea un código de estado para listados compactos (ej. historial).
 */
export function colorizeStatus(status) {
  if (status >= 200 && status < 300) return pc.green(String(status));
  if (status >= 400 && status < 500) return pc.yellow(String(status));
  if (status >= 500) return pc.red(String(status));
  return pc.cyan(String(status));
}

/**
 * Determina si los datos recibidos son un arreglo no vacío de objetos planos.
 */
export function isArrayOfObjects(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))
  );
}

function formatCellValue(value) {
  if (value === null || value === undefined) return pc.dim('—');
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (str.length <= MAX_CELL_LENGTH) return str;
  return `${str.slice(0, MAX_CELL_LENGTH - 1)}…`;
}

/**
 * Convierte un arreglo de objetos en una tabla ASCII legible usando cli-table3.
 */
export function renderObjectsTable(rows) {
  const columns = [];
  const seen = new Set();

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  const table = new Table({
    head: columns.map((col) => pc.bold(pc.cyan(col))),
    style: { head: [], border: ['gray'] }
  });

  for (const row of rows) {
    table.push(columns.map((col) => formatCellValue(row[col])));
  }

  return table.toString();
}

/**
 * Formatea JSON con indentación y resaltado de sintaxis.
 */
export function renderHighlightedJson(data) {
  const formatted = JSON.stringify(data, null, 2);
  return highlight(formatted, { language: 'json', ignoreIllegals: true });
}

/**
 * Renderiza en consola la respuesta completa de una petición HTTP.
 */
export function renderResponse(result, { method, path }) {
  console.log('');

  if (result.networkError) {
    const errorBox = boxen(
      [
        `${pc.red(pc.bold('Error de conexión'))} ${pc.dim(`(${result.durationMs} ms)`)}`,
        `${pc.bold('Petición:')} ${method} ${path}`,
        `${pc.bold('Código:')} ${result.networkError.code}`,
        `${pc.bold('Detalle:')} ${result.networkError.message}`
      ].join('\n'),
      {
        padding: 1,
        borderColor: 'red',
        borderStyle: 'round',
        title: 'Fallo de Red'
      }
    );
    console.log(errorBox);
    console.log('');
    return;
  }

  const statusBadge = formatStatusBadge(result.status, result.statusText);
  const metaLine = `${statusBadge}  ${pc.bold(method)} ${pc.cyan(path)}  ${pc.dim(`(${result.durationMs} ms)`)}`;
  console.log(metaLine);
  console.log('');

  if (result.data === undefined || result.data === null || result.data === '') {
    console.log(pc.dim('(Sin contenido en el cuerpo de la respuesta)'));
  } else if (isArrayOfObjects(result.data)) {
    console.log(renderObjectsTable(result.data));
    console.log(pc.dim(`Total de registros: ${result.data.length}`));
  } else if (typeof result.data === 'object') {
    console.log(renderHighlightedJson(result.data));
  } else {
    console.log(String(result.data));
  }

  console.log('');
}

/**
 * Renderiza el estado decodificado del Token JWT actual dentro de una caja.
 */
export function renderJwtStatus(tokenStatus) {
  if (!tokenStatus.hasToken) {
    console.log(
      boxen(
        `${pc.yellow('No hay ningún token JWT guardado actualmente.')}\n${pc.dim(
          'Usa "Iniciar sesión / Registrar usuario" para autenticarte.'
        )}`,
        {
          padding: 1,
          borderColor: 'yellow',
          borderStyle: 'round',
          title: 'Estado del Token JWT'
        }
      )
    );
    return;
  }

  if (!tokenStatus.valid) {
    console.log(
      boxen(
        `${pc.red('El token almacenado no es un JWT válido.')}\n${pc.dim(
          tokenStatus.error || 'Formato inválido'
        )}`,
        {
          padding: 1,
          borderColor: 'red',
          borderStyle: 'round',
          title: 'Estado del Token JWT'
        }
      )
    );
    return;
  }

  const statusLabel = tokenStatus.isExpired
    ? pc.red(pc.bold(`EXPIRADO (${tokenStatus.remainingText})`))
    : pc.green(pc.bold(`ACTIVO (${tokenStatus.remainingText})`));

  const lines = [
    `${pc.bold('Estado:')}     ${statusLabel}`,
    `${pc.bold('Emitido:')}    ${
      tokenStatus.issuedAt ? tokenStatus.issuedAt.toLocaleString() : pc.dim('No especificado')
    }`,
    `${pc.bold('Expira:')}     ${
      tokenStatus.expiresAt ? tokenStatus.expiresAt.toLocaleString() : pc.dim('Sin expiración')
    }`,
    '',
    pc.bold(pc.cyan('Payload decodificado:')),
    renderHighlightedJson(tokenStatus.payload)
  ];

  console.log(
    boxen(lines.join('\n'), {
      padding: 1,
      borderColor: tokenStatus.isExpired ? 'red' : 'green',
      borderStyle: 'round',
      title: 'Token JWT Actual'
    })
  );
}
