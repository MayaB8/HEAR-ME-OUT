const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

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
  query = async (sql, values) => ({ rows: values[0] === user.username ? [user] : [] });
  for (const username of ['alice', 'unknown']) {
    const response = await login({ username, password: 'wrong' });
    assert.equal(response.status, 401);
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
