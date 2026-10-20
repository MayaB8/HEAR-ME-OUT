const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

let query;
require.cache[require.resolve('../src/db')] = { exports: { query: (...args) => query(...args) } };
const app = require('../src/server');
let server;
let baseUrl;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

const request = (method = 'GET', body, cookie = 'session_id=clinician-session') => fetch(`${baseUrl}/api/children`, {
  method,
  headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

function authenticated(handler) {
  query = async (sql, values) => {
    if (/FROM sessions/.test(sql)) {
      assert.match(sql, /JOIN users ON users.id = sessions.user_id/);
      assert.match(sql, /sessions.id_hash = \$1/);
      assert.match(sql, /sessions.expires_at > NOW\(\)/);
      assert.equal(values[0], crypto.createHash('sha256').update('clinician-session').digest('hex'));
      return { rows: [{ id: 7, username: 'clinician' }] };
    }
    return handler(sql, values);
  };
}

test('creates a trimmed child belonging to the session clinician, ignoring body clinician_id', async () => {
  const created = { id: 1, clinician_id: 7, child_code: 'C1', first_name: 'Noa', last_name: 'Levi', created_at: '2026-10-20T00:00:00.000Z' };
  let inserts = 0;
  authenticated(async (sql, values) => {
    assert.match(sql, /INSERT INTO children \(clinician_id, child_code, first_name, last_name\)/);
    assert.match(sql, /RETURNING id, clinician_id, child_code, first_name, last_name, created_at/);
    assert.deepEqual(values, [7, 'C1', 'Noa', 'Levi']);
    inserts++;
    return { rows: [created] };
  });
  const response = await request('POST', { clinician_id: 99, childCode: ' C1 ', firstName: ' Noa ', lastName: ' Levi ' });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), created);
  assert.equal(inserts, 1);
});

test('omitted or blank lastName is stored as null', async () => {
  authenticated(async (sql, values) => {
    assert.equal(values[3], null);
    return { rows: [{ id: 1 }] };
  });
  for (const lastName of [undefined, '   ']) {
    assert.equal((await request('POST', { childCode: 'C1', firstName: 'Noa', lastName })).status, 201);
  }
});

test('invalid child fields return 400 without inserting', async () => {
  authenticated(() => assert.fail('Invalid input must not insert'));
  for (const body of [{}, { childCode: ' ', firstName: 'Noa' }, { childCode: 1, firstName: 'Noa' },
    { childCode: 'C1', firstName: '' }, { childCode: 'C1', firstName: [] },
    { childCode: 'C1', firstName: 'Noa', lastName: null }, { childCode: 'C1', firstName: 'Noa', lastName: 1 }]) {
    assert.equal((await request('POST', body)).status, 400, JSON.stringify(body));
  }
});

test('duplicate clinician child code returns 409; other database failures return 500', async () => {
  for (const [constraint, status] of [['children_clinician_id_child_code_key', 409], ['children_pkey', 500]]) {
    authenticated(async () => { throw Object.assign(new Error('private database error'), { code: '23505', constraint }); });
    const response = await request('POST', { childCode: 'C1', firstName: 'Noa' });
    assert.equal(response.status, status);
    assert.equal((await response.text()).includes('private database error'), false);
  }
});

test('GET and POST reject missing, unknown and expired sessions before accessing children', async () => {
  for (const method of ['GET', 'POST']) {
    query = () => assert.fail('Missing cookie must not query');
    assert.equal((await request(method, undefined, '')).status, 401);
    for (const token of ['unknown', 'expired']) {
      query = async sql => {
        assert.match(sql, /FROM sessions/);
        assert.match(sql, /sessions.expires_at > NOW\(\)/);
        return { rows: [] };
      };
      assert.equal((await request(method, undefined, `session_id=${token}`)).status, 401);
    }
  }
});

test('GET filters by the session clinician and requests newest children first', async () => {
  const own = { id: 1, child_code: 'C1', first_name: 'Noa', last_name: null, created_at: '2026-10-20T00:00:00.000Z' };
  authenticated(async (sql, values) => {
    assert.match(sql, /SELECT id, child_code, first_name, last_name, created_at/);
    assert.match(sql, /WHERE clinician_id = \$1/);
    assert.match(sql, /ORDER BY created_at DESC/);
    assert.deepEqual(values, [7]);
    return { rows: [own] };
  });
  const response = await fetch(`${baseUrl}/api/children?clinician_id=99`, { headers: { Cookie: 'session_id=clinician-session' } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [own]);
});

test('GET returns an empty array for a clinician with no children', async () => {
  authenticated(async () => ({ rows: [] }));
  const response = await request();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test('session lookup and children query failures return generic 500 errors', async () => {
  for (const method of ['GET', 'POST']) {
    for (const failAuth of [true, false]) {
      const failure = async () => { throw new Error('private database error'); };
      if (failAuth) query = failure;
      else authenticated(failure);
      const response = await request(method, method === 'POST' ? { childCode: 'C1', firstName: 'Noa' } : undefined);
      assert.equal(response.status, 500);
      assert.equal((await response.text()).includes('private database error'), false);
    }
  }
});
