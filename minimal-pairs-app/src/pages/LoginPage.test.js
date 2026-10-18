import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import LoginPage from './LoginPage';
import { submitCredentials } from '../usersApi';

jest.mock('../usersApi');

function openLogin(onLogin) {
  render(<ThemeProvider theme={theme}><MemoryRouter initialEntries={['/login']}><Routes>
    <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
    <Route path="/" element={<p>מסך ראשי</p>} />
  </Routes></MemoryRouter></ThemeProvider>);
}

function fillForm(container = screen) {
  fireEvent.change(container.getByLabelText('שם משתמש'), { target: { value: 'Maya' } });
  fireEvent.change(container.getByLabelText('סיסמה'), { target: { value: 'secret123' } });
}

beforeEach(() => jest.resetAllMocks());

test('login uses Hebrew RTL fields and navigates after successful API login', async () => {
  submitCredentials.mockResolvedValue({ id: 1, username: 'maya' });
  const onLogin = jest.fn();
  openLogin(onLogin);
  expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
  expect(screen.getByPlaceholderText('הזן שם משתמש')).toHaveAttribute('dir', 'rtl');
  fillForm();
  fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));
  expect(await screen.findByText('מסך ראשי')).toBeInTheDocument();
  expect(submitCredentials).toHaveBeenCalledWith(false, 'Maya', 'secret123');
  expect(onLogin).toHaveBeenCalledWith({ id: 1, username: 'maya' });
});

test('login shows API errors and allows retrying', async () => {
  submitCredentials.mockRejectedValue(new Error('שם המשתמש או הסיסמה אינם נכונים.'));
  openLogin();
  fillForm();
  fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('שם המשתמש או הסיסמה אינם נכונים.');
  expect(screen.getByRole('button', { name: 'התחבר' })).toBeEnabled();
});

test('registration shows success inside the popup until continuing to login', async () => {
  submitCredentials.mockResolvedValue({ id: 1, username: 'maya' });
  openLogin();
  fireEvent.click(screen.getByRole('button', { name: 'הרשמה חדשה' }));
  const dialog = within(screen.getByRole('dialog'));
  fillForm(dialog);
  fireEvent.change(dialog.getByLabelText('אימות סיסמה'), { target: { value: 'secret123' } });
  fireEvent.click(dialog.getByRole('button', { name: 'צור חשבון' }));
  expect(await dialog.findByRole('status')).toHaveTextContent('נוצר בהצלחה');
  expect(submitCredentials).toHaveBeenCalledWith(true, 'Maya', 'secret123');
  expect(dialog.queryByRole('button', { name: 'צור חשבון' })).not.toBeInTheDocument();
  fireEvent.click(dialog.getByRole('button', { name: 'למעבר להתחברות' }));
  expect(await screen.findByRole('heading', { name: /התחברות.*לחשבון/ })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'הרשמה חדשה' }));
  expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'צור חשבון' })).toBeInTheDocument();
});

test('registration shows duplicate username error inside the modal', async () => {
  submitCredentials.mockRejectedValue(new Error('שם המשתמש כבר תפוס. בחרו שם אחר.'));
  openLogin();
  fireEvent.click(screen.getByRole('button', { name: 'הרשמה חדשה' }));
  const dialog = within(screen.getByRole('dialog'));
  fillForm(dialog);
  fireEvent.change(dialog.getByLabelText('אימות סיסמה'), { target: { value: 'secret123' } });
  fireEvent.click(dialog.getByRole('button', { name: 'צור חשבון' }));
  expect(await dialog.findByRole('alert')).toHaveTextContent('שם המשתמש כבר תפוס');
});

test('whitespace-only credentials are rejected without an API request', async () => {
  openLogin();
  fillForm();
  fireEvent.change(screen.getByLabelText('שם משתמש'), { target: { value: '   ' } });
  fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('יש למלא שם משתמש וסיסמה.');
  expect(submitCredentials).not.toHaveBeenCalled();
});

test('registration rejects mismatched passwords without calling the API', async () => {
  openLogin();
  fireEvent.click(screen.getByRole('button', { name: 'הרשמה חדשה' }));
  const dialog = within(screen.getByRole('dialog'));
  fillForm(dialog);
  fireEvent.change(dialog.getByLabelText('אימות סיסמה'), { target: { value: 'different' } });
  fireEvent.click(dialog.getByRole('button', { name: 'צור חשבון' }));
  expect(await dialog.findByRole('alert')).toHaveTextContent('הסיסמאות אינן תואמות');
  expect(submitCredentials).not.toHaveBeenCalled();
});
