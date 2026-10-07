const originalBase = process.env.REACT_APP_API_BASE_URL;
const originalFetch = global.fetch;
beforeEach(() => {
  jest.resetModules();
  process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001/';
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
});
afterEach(() => {
  if (originalBase === undefined) delete process.env.REACT_APP_API_BASE_URL;
  else process.env.REACT_APP_API_BASE_URL = originalBase;
  global.fetch = originalFetch;
});

test('encodes Hebrew filters and returns API data', async () => {
  const data = [{ id: 1, words: [{ text: 'צב', imageUrl: 'https://example.com/image.png' }] }];
  fetch.mockResolvedValue({ ok: true, json: async () => data });
  const { getMinimalPairs } = require('./minimalPairsApi');
  expect(await getMinimalPairs('אופן חיתוך', 'ת,ט-צ', 'start')).toEqual(data);
  const url = new URL(fetch.mock.calls[0][0]);
  expect(url.origin).toBe('http://localhost:3001');
  expect(url.pathname).toBe('/api/minimal-pairs');
  expect(url.searchParams.get('exerciseType')).toBe('אופן חיתוך');
  expect(url.searchParams.get('soundPair')).toBe('ת,ט-צ');
  expect(url.searchParams.get('position')).toBe('start');
});

test('all selections omit optional filters', async () => {
  const { getMinimalPairs } = require('./minimalPairsApi');
  await getMinimalPairs('קוליות', 'הכל', 'הכל');
  const params = new URL(fetch.mock.calls[0][0]).searchParams;
  expect(params.get('exerciseType')).toBe('קוליות');
  expect(params.has('soundPair')).toBe(false);
  expect(params.has('position')).toBe(false);
});

test('uses the default category when no argument is supplied', async () => {
  const { getMinimalPairs } = require('./minimalPairsApi');
  await getMinimalPairs();
  expect(new URL(fetch.mock.calls[0][0]).searchParams.get('exerciseType')).toBe('אופן חיתוך');
});

test('rejects HTTP errors', async () => {
  fetch.mockResolvedValue({ ok: false });
  const { getMinimalPairs } = require('./minimalPairsApi');
  await expect(getMinimalPairs()).rejects.toThrow('Failed to fetch minimal pairs');
});

test('reports missing configuration without making a request', async () => {
  delete process.env.REACT_APP_API_BASE_URL;
  const { getMinimalPairs } = require('./minimalPairsApi');
  await expect(getMinimalPairs()).rejects.toThrow('REACT_APP_API_BASE_URL');
  expect(fetch).not.toHaveBeenCalled();
});
