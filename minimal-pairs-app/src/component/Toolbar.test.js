import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import Toolbar from './Toolbar';

function openToolbar(user = null, onLogout = jest.fn(), initialPath = '/') {
  render(<ThemeProvider theme={theme}><MemoryRouter initialEntries={[initialPath]}>
    <Toolbar user={user} onLogout={onLogout} />
    <Routes>
      <Route path="/" element={<p>ראשי</p>} />
      <Route path="/login" element={<p>מסך התחברות</p>} />
      <Route path="/children" element={<p>רשימת הילדים</p>} />
    </Routes>
  </MemoryRouter></ThemeProvider>);
}

test('account button opens login for a visitor', async () => {
  openToolbar();
  fireEvent.click(screen.getByRole('button', { name: 'התחברות' }));
  expect(await screen.findByText('מסך התחברות')).toBeInTheDocument();
});

test('children management closes the account menu and navigates to children', async () => {
  openToolbar({ id: 1, username: 'maya' });
  const account = screen.getByRole('button', { name: 'maya' });
  fireEvent.click(account);
  fireEvent.click(screen.getByRole('menuitem', { name: 'ניהול ילדים' }));
  expect(await screen.findByText('רשימת הילדים')).toBeInTheDocument();
  expect(account).toHaveAttribute('aria-expanded', 'false');
});

test('home button navigates directly from the children page', async () => {
  openToolbar({ id: 1, username: 'maya' }, jest.fn(), '/children');
  fireEvent.click(screen.getByRole('button', { name: 'דף הבית' }));
  expect(await screen.findByText('ראשי')).toBeInTheDocument();
});

test('hamburger menu has no login item while the separate login button remains', () => {
  openToolbar();
  expect(screen.getByRole('button', { name: 'התחברות' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'תפריט' }));
  expect(screen.queryByRole('menuitem', { name: 'התחברות' })).not.toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'תרגול' })).toBeInTheDocument();
});

test('logged in username opens a menu and logout calls the handler', () => {
  const onLogout = jest.fn();
  openToolbar({ id: 1, username: 'maya' }, onLogout);
  const button = screen.getByRole('button', { name: 'maya' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('menuitem', { name: 'הצג פרופיל (בקרוב)' })).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(screen.getByRole('menuitem', { name: 'התנתקות' }));
  expect(onLogout).toHaveBeenCalledTimes(1);
  expect(button).toHaveAttribute('aria-expanded', 'false');
});
