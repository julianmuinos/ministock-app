import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeBaseUrl,
  normalizePath,
  parseJsonBody,
  validateBaseUrl,
  validateEmail
} from '../src/utils/validators.js';
import {
  isArrayOfObjects,
  renderHighlightedJson,
  renderObjectsTable
} from '../src/ui/responseRenderer.js';

describe('validators', () => {
  it('valida y normaliza URLs base', () => {
    assert.equal(validateBaseUrl('http://localhost:4000/api'), undefined);
    assert.equal(validateBaseUrl('https://api.ejemplo.com/v1/'), undefined);
    assert.ok(validateBaseUrl('ftp://ejemplo.com'));
    assert.ok(validateBaseUrl('no-es-url'));
    assert.equal(normalizeBaseUrl('  http://localhost:4000/api///  '), 'http://localhost:4000/api');
  });

  it('normaliza rutas relativas y emails', () => {
    assert.equal(normalizePath('productos'), '/productos');
    assert.equal(normalizePath('///productos/123'), '/productos/123');
    assert.equal(normalizePath(''), '/');
    assert.equal(validateEmail('dev@itba.edu.ar'), undefined);
    assert.ok(validateEmail('invalido'));
  });

  it('valida body JSON con JSON.parse()', () => {
    assert.deepEqual(parseJsonBody('{"name":"Mouse","price":50}'), {
      ok: true,
      data: { name: 'Mouse', price: 50 }
    });
    assert.equal(parseJsonBody('{name: Mouse}').ok, false);
    assert.equal(parseJsonBody('   ').ok, false);
    assert.equal(parseJsonBody('"solo texto"').ok, false);
  });
});

describe('responseRenderer', () => {
  it('detecta arreglos de objetos y genera tabla ASCII con cli-table3', () => {
    const rows = [
      { id: 1, name: 'Teclado', price: 12000 },
      { id: 2, name: 'Mouse', price: 8500, stock: 4 }
    ];
    assert.equal(isArrayOfObjects(rows), true);
    assert.equal(isArrayOfObjects([]), false);
    assert.equal(isArrayOfObjects(['a', 'b']), false);

    const table = renderObjectsTable(rows);
    assert.match(table, /Teclado/);
    assert.match(table, /Mouse/);
    assert.match(table, /stock/);
  });

  it('formatea JSON con indentación y resaltado', () => {
    const output = renderHighlightedJson({ ok: true, count: 3 });
    assert.match(output, /"ok"/);
    assert.match(output, /true/);
  });
});
