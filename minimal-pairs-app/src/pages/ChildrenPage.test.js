import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import ChildrenPage from './ChildrenPage';
import { getChildren, createChild } from '../usersApi';

jest.mock('../usersApi', () => ({ getChildren: jest.fn(), createChild: jest.fn() }));

beforeEach(() => {
  jest.resetAllMocks();
  getChildren.mockResolvedValue([]);
});

function renderPage() {
  render(<ThemeProvider theme={theme}><ChildrenPage /></ThemeProvider>);
}

async function fillForm() {
  await screen.findByText(/עדיין אין ילדים ברשימה/);
  fireEvent.click(screen.getByRole('button', { name: 'הוספת ילד' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('קוד ילד'), { target: { value: ' C01 ' } });
  fireEvent.change(within(dialog).getByLabelText('שם פרטי'), { target: { value: ' נועה ' } });
  return dialog;
}

test('shows loading followed by the empty state', async () => {
  renderPage();
  expect(screen.getByRole('status')).toHaveTextContent('טוען ילדים');
  expect(await screen.findByText(/עדיין אין ילדים ברשימה/)).toBeInTheDocument();
});

test('shows names and codes in a vertical list', async () => {
  getChildren.mockResolvedValue([
    { id: 1, first_name: 'נועה', last_name: 'לוי', child_code: 'C01' },
    { id: 2, first_name: 'דן', last_name: null, child_code: 'C02' },
  ]);
  renderPage();
  expect(await screen.findByText('נועה לוי')).toBeInTheDocument();
  expect(screen.getByText('דן')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.getByText('C02')).toBeInTheDocument();
});

test('shows a loading error', async () => {
  getChildren.mockRejectedValue(new Error('offline'));
  renderPage();
  expect(await screen.findByRole('alert')).toHaveTextContent('לא ניתן לטעון');
  fireEvent.click(screen.getByRole('button', { name: 'הוספת ילד' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('can open the add dialog while the list is loading', () => {
  getChildren.mockReturnValue(new Promise(() => {}));
  renderPage();
  fireEvent.click(screen.getByRole('button', { name: 'הוספת ילד' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('creates a child with trimmed fields and adds it to the list', async () => {
  createChild.mockResolvedValue({ id: 1, first_name: 'נועה', last_name: null, child_code: 'C01' });
  renderPage();
  const dialog = await fillForm();
  fireEvent.click(within(dialog).getByRole('button', { name: 'הוספת ילד' }));
  expect(await screen.findByText('הילד נוסף בהצלחה.')).toBeInTheDocument();
  expect(createChild).toHaveBeenCalledWith('C01', 'נועה', '');
  expect(await screen.findByRole('listitem')).toHaveTextContent('נועה');
});

test('keeps entered fields and shows a duplicate code error', async () => {
  createChild.mockRejectedValue(new Error('Child code already exists for this clinician.'));
  renderPage();
  const dialog = await fillForm();
  fireEvent.click(within(dialog).getByRole('button', { name: 'הוספת ילד' }));
  expect(await within(dialog).findByRole('alert')).toHaveTextContent('קוד הילד כבר קיים');
  expect(within(dialog).getByLabelText('שם פרטי')).toHaveValue(' נועה ');
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
});
