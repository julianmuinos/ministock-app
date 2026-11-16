import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decodeTokenStatus, extractToken, formatDuration } from '../src/services/jwtService.js';

function createUnsignedJwt(payloadObj) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  return `${header}.${payload}.fakesignature`;
}

describe('jwtService', () => {
  it('extrae el token de distintos formatos habituales de backend', () => {
    assert.equal(extractToken({ token: 't1' }), 't1');
    assert.equal(extractToken({ accessToken: 't2' }), 't2');
    assert.equal(extractToken({ jwt: 't3' }), 't3');
    assert.equal(extractToken({ data: { token: 't4' } }), 't4');
    assert.equal(extractToken({ ok: true }), null);
  });

  it('decodifica un JWT vigente y calcula el tiempo restante', () => {
    const nowSec = 1_700_000_000;
    const token = createUnsignedJwt({
      sub: 'user-123',
      email: 'dev@test.com',
      iat: nowSec - 60,
      exp: nowSec + 3665
    });

    const status = decodeTokenStatus(token, nowSec * 1000);
    assert.equal(status.hasToken, true);
    assert.equal(status.valid, true);
    assert.equal(status.isExpired, false);
    assert.equal(status.payload.email, 'dev@test.com');
    assert.equal(status.remainingText, '1h 1m 5s restantes');
  });

  it('detecta un JWT expirado y reporta el tiempo transcurrido', () => {
    const nowSec = 1_700_000_000;
    const token = createUnsignedJwt({ sub: 'user-123', exp: nowSec - 125 });

    const status = decodeTokenStatus(token, nowSec * 1000);
    assert.equal(status.valid, true);
    assert.equal(status.isExpired, true);
    assert.equal(status.remainingText, 'Expirado hace 2m 5s');
  });

  it('maneja tokens sin exp, vacíos o malformados', () => {
    const noExp = decodeTokenStatus(createUnsignedJwt({ sub: '1' }));
    assert.equal(noExp.valid, true);
    assert.equal(noExp.isExpired, false);
    assert.equal(noExp.expiresAt, null);

    const empty = decodeTokenStatus(null);
    assert.equal(empty.hasToken, false);

    const broken = decodeTokenStatus('no-es-un-jwt');
    assert.equal(broken.hasToken, true);
    assert.equal(broken.valid, false);
  });

  it('formatea duraciones correctamente', () => {
    assert.equal(formatDuration(90061 * 1000), '1d 1h 1m 1s');
    assert.equal(formatDuration(500), '0s');
  });
});
