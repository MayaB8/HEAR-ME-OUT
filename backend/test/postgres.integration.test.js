const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');

// Explicit opt-in. Every table and test record lives in a separate, disposable schema.
test('PostgreSQL: ownership, uniqueness, expiration, session persistence and logout', {
  skip: !process.env.TEST_DATABASE_URL,
}, async () => {
  const schema = `hmo_test_${crypto.randomBytes(8).toString('hex')}`;
  let client = new Client({ connectionString: process.env.TEST_DATABASE_URL });
  let server;
  let baseUrl;
  const startApp = async () => {
    require.cache[require.resolve('../src/db')] = { exports: { query: (...args) => client.query(...args) } };
    delete require.cache[require.resolve('../src/server')];
    server = require('../src/server').listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  };
  const closeApp = () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  const request = (route, method = 'GET', body, cookie) => fetch(`${baseUrl}${route}`, {
    method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const login = async username => {
    const response = await request('/api/login', 'POST', { username, password: 'test-password' });
    assert.equal(response.status, 200);
    return response.headers.get('set-cookie').split(';')[0];
  };

  await client.connect();
  try {
    await client.query(`CREATE SCHEMA ${schema}`);
    await client.query(`SET search_path TO ${schema}`);
    await client.query(readFileSync(path.resolve(__dirname, '../sql/schema.sql'), 'utf8'));
    await startApp();
    const users = [];
    for (const username of ['clinician-one', 'clinician-two']) {
      const response = await request('/api/users', 'POST', { username, password: 'test-password' });
      assert.equal(response.status, 201);
      users.push(await response.json());
    }
    const cookie = await login('clinician-one');
    const otherCookie = await login('clinician-two');
    const body = { childCode: 'C1', firstName: 'Noa' };
    const created = await request('/api/children', 'POST', { ...body, clinician_id: users[1].id }, cookie);
    assert.equal(created.status, 201);
    assert.equal((await created.json()).clinician_id, users[0].id);
    assert.equal((await request('/api/children', 'POST', body, cookie)).status, 409);
    assert.equal((await request('/api/children', 'POST', { ...body, firstName: 'Other' }, otherCookie)).status, 201);
    assert.equal((await request('/api/children', 'POST', body)).status, 401);
    assert.equal((await request('/api/children')).status, 401);
    const own = await (await request('/api/children', 'GET', undefined, cookie)).json();
    assert.equal(own.length, 1);
    assert.equal(own[0].first_name, 'Noa');
    assert.deepEqual(Object.keys(own[0]).sort(), ['id', 'child_code', 'first_name', 'last_name', 'created_at'].sort());

    // Recreate the Express app and PostgreSQL connection; the cookie must still work.
    await closeApp();
    server = null;
    await client.end();
    client = new Client({ connectionString: process.env.TEST_DATABASE_URL });
    await client.connect();
    await client.query(`SET search_path TO ${schema}`);
    await startApp();
    const restored = await request('/api/me', 'GET', undefined, cookie);
    assert.equal(restored.status, 200);
    assert.equal((await restored.json()).id, users[0].id);

    const rawId = cookie.slice('session_id='.length);
    const hash = crypto.createHash('sha256').update(rawId).digest('hex');
    assert.equal((await client.query('SELECT id_hash FROM sessions WHERE id_hash = $1', [rawId])).rowCount, 0);
    await client.query("UPDATE sessions SET expires_at = NOW() - INTERVAL '1 second' WHERE id_hash = $1", [hash]);
    assert.equal((await request('/api/me', 'GET', undefined, cookie)).status, 401);
    assert.equal((await request('/api/children', 'GET', undefined, cookie)).status, 401);
    assert.equal((await request('/api/children', 'POST', body, cookie)).status, 401);

    const freshCookie = await login('clinician-one');
    assert.equal((await request('/api/logout', 'POST', undefined, freshCookie)).status, 204);
    assert.equal((await request('/api/me', 'GET', undefined, freshCookie)).status, 401);
    assert.equal((await request('/api/children', 'GET', undefined, freshCookie)).status, 401);
    await client.query('DELETE FROM users WHERE id = $1', [users[0].id]);
    assert.equal((await client.query('SELECT id FROM children WHERE clinician_id = $1', [users[0].id])).rowCount, 0);
    assert.equal((await client.query('SELECT id_hash FROM sessions WHERE user_id = $1', [users[0].id])).rowCount, 0);
  } finally {
    if (server) await closeApp();
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await client.end();
  }
});
