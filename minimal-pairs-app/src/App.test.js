import { render, screen, act } from '@testing-library/react';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { fireEvent } from '@testing-library/react';
import { getCurrentUser } from './usersApi';

jest.mock('./usersApi', () => ({
  getCurrentUser: jest.fn(),
  logoutUser: jest.fn(),
}));

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  getCurrentUser.mockReset();
  getCurrentUser.mockResolvedValue(null);
});

test('opens exercise settings from the home page', async () => {
  render(<ThemeProvider theme={theme}><App /></ThemeProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'תרגול' }));
  expect(screen.getByText('זוג צלילים')).toBeInTheDocument();
  expect(screen.getByText('מיקום במילה')).toBeInTheDocument();
});

test('restores the user on startup after showing a loading state', async () => {
  let resolveUser;
  getCurrentUser.mockReturnValue(new Promise(resolve => { resolveUser = resolve; }));
  const { rerender } = render(<ThemeProvider theme={theme}><App /></ThemeProvider>);
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'התחברות' })).not.toBeInTheDocument();

  await act(async () => { resolveUser({ id: 1, username: 'maya' }); });
  expect(screen.getByRole('button', { name: 'maya' })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(<ThemeProvider theme={theme}><App /></ThemeProvider>);
  expect(getCurrentUser).toHaveBeenCalledTimes(1);
});

test('a null restore result shows the signed-out UI without an error', async () => {
  render(<ThemeProvider theme={theme}><App /></ThemeProvider>);
  expect(await screen.findByRole('button', { name: 'התחברות' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('a restore failure shows an error instead of the signed-out UI', async () => {
  getCurrentUser.mockRejectedValue(new Error('Server unavailable'));
  render(<ThemeProvider theme={theme}><App /></ThemeProvider>);
  expect(await screen.findByRole('alert')).toHaveTextContent('לא ניתן לבדוק את מצב ההתחברות');
  expect(screen.queryByRole('button', { name: 'התחברות' })).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
