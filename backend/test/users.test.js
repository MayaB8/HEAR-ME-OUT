const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');

let query;
require.cache[require.resolve('../src/db')] = {
  exports: { query: (...args) => query(...args) },
};
const app = require('../src/server');
let server;
let url;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  url = `http://127.0.0.1:${server.address().port}/api/users`;
});
after(() => new Promise(resolve => server.close(resolve)));

const register = body => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

test('rejects missing, blank, non-string, and oversized password input before querying', async () => {
  query = () => assert.fail('Invalid input must not query the database');
  const invalid = [
    {}, { username: 'alice' }, { password: 'secret' },
    { username: '', password: 'secret' }, { username: '  ', password: 'secret' },
    { username: 123, password: 'secret' }, { username: ['alice'], password: 'secret' },
    { username: 'alice', password: '' }, { username: 'alice', password: '  ' },
    { username: 'alice', password: null }, { username: 'alice', password: 123 },
    { username: 'alice', password: 'a'.repeat(73) },
    { username: 'alice', password: '😀'.repeat(19) },
  ];
  for (const body of invalid) {
    assert.equal((await register(body)).status, 400, JSON.stringify(body));
  }
  assert.equal((await fetch(url, { method: 'POST' })).status, 400);
});

test('returns 201 with public fields and stores a salted bcrypt hash with a normalized username', async () => {
  const username = 'alice';
  const password = ' secret with spaces ';
  const user = { id: 1, username, created_at: '2026-10-15T00:00:00.000Z' };
  const hashes = [];
  query = async (sql, values) => {
    assert.equal(values[0], username);
    assert.notEqual(values[1], password);
    assert.equal(await bcrypt.compare(password, values[1]), true);
    assert.equal(bcrypt.getRounds(values[1]), 12);
    hashes.push(values[1]);
    return { rows: [user] };
  };
  for (let i = 0; i < 2; i++) {
    const response = await register({ username: `  ${username.toUpperCase()}  `, password });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), user);
  }
  assert.notEqual(hashes[0], hashes[1]);
});

test('returns 409 for the username unique constraint', async () => {
  query = async () => { throw Object.assign(new Error('duplicate'), {
    code: '23505', constraint: 'users_username_key',
  }); };
  const response = await register({ username: 'alice', password: 'secret' });
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), { error: 'Username already exists.' });
});

test('returns a generic 500 for unexpected database and hashing failures', async () => {
  query = async () => { throw new Error('sensitive database details'); };
  let response = await register({ username: 'alice', password: 'secret' });
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: 'Unable to register user.' });
  const hash = bcrypt.hash;
  bcrypt.hash = async () => { throw new Error('hash failure'); };
  query = () => assert.fail('Hash failure must not query the database');
  try {
    response = await register({ username: 'alice', password: 'secret' });
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'Unable to register user.' });
  } finally {
    bcrypt.hash = hash;
  }
});

test('allows POST in CORS preflight', async () => {
  const response = await fetch(url, {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'POST' },
  });
  assert.equal(response.status, 204);
  assert.match(response.headers.get('access-control-allow-methods'), /POST/);
});

const login = body => fetch(url.replace('/api/users', '/api/login'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const sessionRequest = (path, cookie, method = 'GET') => fetch(
  url.replace('/api/users', path),
  { method, headers: cookie ? { Cookie: cookie } : {} },
);

test('login creates a hashed session and logout revokes access to /api/me', async () => {
  const publicUser = { id: 1, username: 'alice', created_at: '2026-10-15T00:00:00.000Z' };
  const user = { ...publicUser, password_hash: await bcrypt.hash('secret', 12) };
  const sessions = new Map();
  const startedAt = Date.now();
  let deletedHash;
  query = async (sql, values) => {
    if (/INSERT INTO sessions/.test(sql)) {
      assert.equal(values[1], user.id);
      assert.ok(values[2] instanceof Date);
      sessions.set(values[0], values[2]);
      return { rows: [] };
    }
    if (/DELETE FROM sessions/.test(sql)) {
      assert.match(sql, /WHERE id_hash = \$1/);
      deletedHash = values[0];
      sessions.delete(values[0]);
      return { rows: [] };
    }
    if (/FROM sessions/.test(sql)) {
      assert.match(sql, /JOIN users ON users.id = sessions.user_id/);
      assert.match(sql, /sessions.id_hash = \$1/);
      assert.match(sql, /sessions.expires_at > NOW\(\)/);
      return { rows: sessions.has(values[0]) ? [publicUser] : [] };
    }
    assert.equal(values[0], user.username);
    return { rows: [user] };
  };

  const response = await login({ username: 'alice', password: 'secret' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), publicUser);
  const setCookie = response.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  assert.match(setCookie, /Path=\//);
  assert.match(setCookie, /Max-Age=604800/);
  const cookie = setCookie.split(';')[0];
  const rawId = cookie.slice('session_id='.length);
  assert.match(rawId, /^[a-f0-9]{64}$/);
  const hash = crypto.createHash('sha256').update(rawId).digest('hex');
  assert.equal(sessions.size, 1);
  assert.equal(sessions.has(rawId), false);
  assert.equal(sessions.has(hash), true);
  const lifetime = 7 * 24 * 60 * 60 * 1000;
  assert.ok(sessions.get(hash).getTime() >= startedAt + lifetime);
  assert.ok(sessions.get(hash).getTime() <= Date.now() + lifetime);

  const me = await sessionRequest('/api/me', cookie);
  assert.equal(me.status, 200);
  assert.deepEqual(await me.json(), publicUser);

  const logout = await sessionRequest('/api/logout', cookie, 'POST');
  assert.equal(logout.status, 204);
  assert.equal(await logout.text(), '');
  assert.equal(deletedHash, hash);
  assert.equal(sessions.size, 0);
  assert.match(logout.headers.get('set-cookie'), /session_id=;/);
  assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
  // Replay the old cookie to verify server-side invalidation.
  assert.equal((await sessionRequest('/api/me', cookie)).status, 401);
});

test('/api/me without a cookie returns 401 without querying', async () => {
  query = () => assert.fail('Missing cookie must not query the database');
  assert.equal((await sessionRequest('/api/me')).status, 401);
});

test('/api/me rejects expired or unknown sessions using the SQL expiry condition', async () => {
  query = async (sql, values) => {
    assert.match(sql, /sessions.expires_at > NOW\(\)/);
    assert.equal(values[0], crypto.createHash('sha256').update('expired-session').digest('hex'));
    // PostgreSQL returns no rows when the session is expired or absent.
    return { rows: [] };
  };
  assert.equal((await sessionRequest('/api/me', 'session_id=expired-session')).status, 401);
});

test('logout without a cookie returns 204 without querying', async () => {
  query = () => assert.fail('Missing cookie must not query the database');
  assert.equal((await sessionRequest('/api/logout', undefined, 'POST')).status, 204);
});

test('session insert failure returns 500 without issuing a cookie', async () => {
  const password_hash = await bcrypt.hash('secret', 12);
  query = async sql => {
    if (/INSERT INTO sessions/.test(sql)) throw new Error('database unavailable');
    return { rows: [{ id: 1, username: 'alice', password_hash }] };
  };
  const response = await login({ username: 'alice', password: 'secret' });
  assert.equal(response.status, 500);
  assert.equal(response.headers.get('set-cookie'), null);
});

test('session lookup and delete failures return 500', async () => {
  query = async () => { throw new Error('sensitive database details'); };
  const me = await sessionRequest('/api/me', 'session_id=some-session');
  assert.equal(me.status, 500);
  assert.deepEqual(await me.json(), { error: 'Unable to restore user.' });
  const logout = await sessionRequest('/api/logout', 'session_id=some-session', 'POST');
  assert.equal(logout.status, 500);
  assert.equal(logout.headers.get('set-cookie'), null);
  assert.deepEqual(await logout.json(), { error: 'Unable to log out.' });
});

test('login rejects missing, blank, and non-string credentials with 400', async () => {
  query = () => assert.fail('Invalid input must not query the database');
  for (const body of [
    {}, { username: 'alice' }, { password: 'secret' },
    { username: '', password: 'secret' }, { username: '  ', password: 'secret' },
    { username: null, password: 'secret' }, { username: 123, password: 'secret' },
    { username: ['alice'], password: 'secret' },
    { username: 'alice', password: '' }, { username: 'alice', password: '  ' },
    { username: 'alice', password: null }, { username: 'alice', password: 123 },
    { username: 'alice', password: {} },
  ]) {
    assert.equal((await login(body)).status, 400, JSON.stringify(body));
  }
  assert.equal((await fetch(url.replace('/api/users', '/api/login'), { method: 'POST' })).status, 400);
});

test('login returns 200 with public fields and normalizes username without trimming password', async () => {
  const password = ' secret with spaces ';
  const user = {
    id: 1, username: 'alice', created_at: '2026-10-15T00:00:00.000Z',
    password_hash: await bcrypt.hash(password, 12),
  };
  query = async (sql, values) => ({ rows: values[0] === user.username ? [user] : [] });
  const response = await login({ username: '  ALIce  ', password });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    id: user.id, username: user.username, created_at: user.created_at,
  });
});

test('wrong password and unknown username return identical 401 responses', async () => {
  const user = { username: 'alice', password_hash: await bcrypt.hash('secret', 12) };
  query = async (sql, values) => {
    assert.doesNotMatch(sql, /INSERT INTO sessions/);
    return { rows: values[0] === user.username ? [user] : [] };
  };
  for (const username of ['alice', 'unknown']) {
    const response = await login({ username, password: 'wrong' });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.deepEqual(await response.json(), { error: 'Invalid username or password.' });
  }
});

test('login returns generic 500 for database and bcrypt comparison failures', async () => {
  query = async () => { throw new Error('sensitive database details'); };
  let response = await login({ username: 'alice', password: 'secret' });
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: 'Unable to log in.' });
  query = async () => ({ rows: [{ password_hash: 'hash' }] });
  const compare = bcrypt.compare;
  bcrypt.compare = async () => { throw new Error('sensitive comparison details'); };
  try {
    response = await login({ username: 'alice', password: 'secret' });
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'Unable to log in.' });
  } finally {
    bcrypt.compare = compare;
  }
});
