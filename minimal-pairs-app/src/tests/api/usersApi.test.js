process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001/';
const { getCurrentUser, logoutUser, getChildren, createChild, submitCredentials } = require('../../api/usersApi');
const originalFetch = global.fetch;
beforeEach(() => { global.fetch = jest.fn(); });
afterEach(() => { global.fetch = originalFetch; });

test('login includes browser credentials', async () => {
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });
  await submitCredentials(false, 'maya', 'secret');
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/login', expect.objectContaining({
    method: 'POST', credentials: 'include', body: JSON.stringify({ username: 'maya', password: 'secret' }),
  }));
});

test('restore returns the user or null for 401, and throws on server failure', async () => {
  global.fetch.mockResolvedValueOnce({ status: 200, json: async () => ({ id: 1 }) })
    .mockResolvedValueOnce({ status: 401 }).mockResolvedValueOnce({ status: 500 });
  await expect(getCurrentUser()).resolves.toEqual({ id: 1 });
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/me', { method: 'GET', credentials: 'include' });
  await expect(getCurrentUser()).resolves.toBeNull();
  await expect(getCurrentUser()).rejects.toThrow('Unable to restore');
});

test('logout accepts 204 without parsing a body and rejects failure', async () => {
  global.fetch.mockResolvedValueOnce({ status: 204 }).mockResolvedValueOnce({ status: 500 });
  await expect(logoutUser()).resolves.toBeUndefined();
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/logout', { method: 'POST', credentials: 'include' });
  await expect(logoutUser()).rejects.toThrow('Unable to log out');
});

test('children loading returns an empty list on 200, while 401/500 remain errors', async () => {
  global.fetch.mockResolvedValueOnce({ status: 200, json: async () => [] })
    .mockResolvedValueOnce({ status: 401 }).mockResolvedValueOnce({ status: 500 });
  await expect(getChildren()).resolves.toEqual([]);
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/children', { method: 'GET', credentials: 'include' });
  await expect(getChildren()).rejects.toThrow();
  await expect(getChildren()).rejects.toThrow();
});

test('create sends JSON with credentials and distinguishes duplicate codes', async () => {
  global.fetch.mockResolvedValueOnce({ status: 201, json: async () => ({ id: 2 }) })
    .mockResolvedValueOnce({ status: 409 }).mockResolvedValueOnce({ status: 500 });
  await expect(createChild('C1', 'Noa', 'Levi')).resolves.toEqual({ id: 2 });
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/children', {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ childCode: 'C1', firstName: 'Noa', lastName: 'Levi' }),
  });
  await expect(createChild('C1', 'Noa')).rejects.toThrow('Child code already exists for this clinician.');
  await expect(createChild('C1', 'Noa')).rejects.toThrow('Unable to create child.');
});

test('network failures propagate as errors rather than empty data', async () => {
  global.fetch.mockRejectedValue(new Error('offline'));
  await expect(getChildren()).rejects.toThrow('offline');
  await expect(getCurrentUser()).rejects.toThrow('offline');
  await expect(createChild('C1', 'Noa')).rejects.toThrow('offline');
  await expect(logoutUser()).rejects.toThrow('offline');
});
