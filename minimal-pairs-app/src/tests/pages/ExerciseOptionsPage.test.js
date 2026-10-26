import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../configuration/theme';
import ExerciseOptionsPage from '../../pages/exercises/ExerciseOptionsPage';
import { getChildren } from '../../api/usersApi';

jest.mock('../../api/usersApi', () => ({ getChildren: jest.fn() }));
const clinician = { id: 7, username: 'maya' };
const child = { id: 12, first_name: 'נועה', last_name: 'לוי', child_code: 'C12' };

function ExerciseDestination() {
  return <pre data-testid="exercise-state">{JSON.stringify(useLocation().state)}</pre>;
}

function Page({ user = null }) {
  return <ThemeProvider theme={theme}><MemoryRouter initialEntries={['/options']}>
    <Routes>
      <Route path="/options" element={<ExerciseOptionsPage user={user} />} />
      <Route path="/ExercisePage" element={<ExerciseDestination />} />
      <Route path="/children" element={<p>ניהול ילדים פתוח</p>} />
    </Routes>
  </MemoryRouter></ThemeProvider>;
}

beforeEach(() => {
  getChildren.mockReset();
  getChildren.mockResolvedValue([child]);
});

test('guests do not load children and retain the existing exercise navigation state', async () => {
  render(<Page />);
  expect(getChildren).not.toHaveBeenCalled();
  expect(screen.queryByText('עבור מי התרגול?')).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'התחלת תרגול' })).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'התחלת תרגול' }));
  const state = JSON.parse((await screen.findByTestId('exercise-state')).textContent);
  expect(state).toEqual(expect.objectContaining({ category: expect.any(String), letters: expect.any(String), voice: expect.any(String) }));
  expect(state).not.toHaveProperty('childId');
});

test('loads children and passes the selected numeric child ID to the exercise', async () => {
  render(<Page user={clinician} />);
  expect(screen.getByRole('status')).toHaveTextContent('טוען ילדים');
  const selectValue = await screen.findByText('ללא בחירת ילד');
  fireEvent.mouseDown(selectValue.closest('[role="combobox"]'));
  fireEvent.click(await screen.findByRole('option', { name: 'נועה לוי — C12' }));
  fireEvent.click(screen.getByRole('button', { name: 'התחלת תרגול' }));
  const state = JSON.parse((await screen.findByTestId('exercise-state')).textContent);
  expect(state.childId).toBe(12);
  expect(state.childName).toBe('נועה לוי');
  expect(getChildren).toHaveBeenCalledTimes(1);
});

test('a clinician can explicitly clear child selection and practice without saving', async () => {
  render(<Page user={clinician} />);
  fireEvent.mouseDown((await screen.findByText('ללא בחירת ילד')).closest('[role="combobox"]'));
  fireEvent.click(await screen.findByRole('option', { name: 'נועה לוי — C12' }));
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
  fireEvent.click(await screen.findByRole('option', { name: 'ללא בחירת ילד' }));
  fireEvent.click(screen.getByRole('button', { name: 'התחלת תרגול' }));
  expect(JSON.parse((await screen.findByTestId('exercise-state')).textContent).childId).toBeNull();
});

test('no children shows a link to management instead of a load error', async () => {
  getChildren.mockResolvedValue([]);
  render(<Page user={clinician} />);
  expect(await screen.findByText('עדיין אין ילדים ברשימה שלך.')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'ניהול ילדים' }));
  expect(await screen.findByText('ניהול ילדים פתוח')).toBeInTheDocument();
});

test('load failure is distinct from an empty list and still permits unlinked practice', async () => {
  getChildren.mockRejectedValue(new Error('offline'));
  render(<Page user={clinician} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('לא ניתן לטעון');
  expect(screen.queryByText('עדיין אין ילדים ברשימה שלך.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'התחלת תרגול' }));
  expect(JSON.parse((await screen.findByTestId('exercise-state')).textContent).childId).toBeNull();
});

test('changing clinician clears selection and ignores the previous clinician response', async () => {
  let resolvePrevious;
  getChildren.mockReturnValueOnce(new Promise(resolve => { resolvePrevious = resolve; }));
  const { rerender } = render(<Page user={clinician} />);
  getChildren.mockResolvedValueOnce([]);
  rerender(<Page user={{ id: 8, username: 'other' }} />);
  await screen.findByText('עדיין אין ילדים ברשימה שלך.');
  await act(async () => { resolvePrevious([child]); });
  expect(screen.queryByText('ללא בחירת ילד')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'התחלת תרגול' }));
  expect(JSON.parse((await screen.findByTestId('exercise-state')).textContent).childId).toBeNull();
});

async function chooseSetting(index, name) {
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  fireEvent.mouseDown(screen.getAllByRole('combobox')[index]);
  fireEvent.click(await screen.findByRole('option', { name }));
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
}

test('changing sound pair preserves a supported position and the selected voice', async () => {
  render(<Page />);
  await chooseSetting(2, 'סוף');
  await chooseSetting(3, 'אישה');
  await chooseSetting(1, /ס-צ/);
  expect(screen.getAllByRole('combobox')[2]).toHaveTextContent('סוף');
  fireEvent.click(screen.getByRole('button', { name: 'התחלת תרגול' }));
  expect(JSON.parse((await screen.findByTestId('exercise-state')).textContent)).toEqual(expect.objectContaining({
    letters: 'ס-צ', placeInWord: 'end', voice: 'אישה',
  }));
});

test('changing sound pair resets only an unsupported position', async () => {
  render(<Page />);
  await chooseSetting(2, 'סוף');
  await chooseSetting(1, /ת,ט-צ/);
  expect(screen.getAllByRole('combobox')[2]).toHaveTextContent('הכל');
  await chooseSetting(2, 'אמצע');
  await chooseSetting(1, /ס-צ/);
  expect(screen.getAllByRole('combobox')[2]).toHaveTextContent('אמצע');
});

test('reselecting a category keeps valid settings; changing category preserves position', async () => {
  render(<Page />);
  await chooseSetting(1, /ס-צ/);
  await chooseSetting(2, 'סוף');
  await chooseSetting(0, 'אופן חיתוך');
  expect(screen.getAllByRole('combobox')[1]).toHaveTextContent('ס-צ');
  expect(screen.getAllByRole('combobox')[2]).toHaveTextContent('סוף');
  await chooseSetting(0, 'קוליות');
  expect(screen.getAllByRole('combobox')[1]).toHaveTextContent('הכל');
  expect(screen.getAllByRole('combobox')[2]).toHaveTextContent('סוף');
});
