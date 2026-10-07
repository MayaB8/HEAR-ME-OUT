import { render, screen } from '@testing-library/react';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { fireEvent } from '@testing-library/react';

test('opens exercise settings from the home page', () => {
  render(<ThemeProvider theme={theme}><App /></ThemeProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'תרגול' }));
  expect(screen.getByText('זוג צלילים')).toBeInTheDocument();
  expect(screen.getByText('מיקום במילה')).toBeInTheDocument();
});
