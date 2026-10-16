import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import Toolbar from './Toolbar';

function openToolbar(user = null) {
  render(<ThemeProvider theme={theme}><MemoryRouter>
    <Toolbar user={user} />
    <Routes>
      <Route path="/" element={<p>ראשי</p>} />
      <Route path="/login" element={<p>מסך התחברות</p>} />
    </Routes>
  </MemoryRouter></ThemeProvider>);
}

test('account button opens login for a visitor', async () => {
  openToolbar();
  fireEvent.click(screen.getByRole('button', { name: 'התחברות' }));
  expect(await screen.findByText('מסך התחברות')).toBeInTheDocument();
});

test('logged in username opens a menu with disabled sample actions', () => {
  openToolbar({ id: 1, username: 'maya' });
  const button = screen.getByRole('button', { name: 'maya' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('menuitem', { name: 'הצג פרופיל (בקרוב)' })).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByRole('menuitem', { name: 'התנתקות (בקרוב)' })).toHaveAttribute('aria-disabled', 'true');
});
