import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import ExercisePage from './ExercisePage';
import { getMinimalPairs } from '../minimalPairsApi';

jest.mock('../minimalPairsApi');
jest.mock('react-confetti', () => () => null);
const settings = { category: 'קוליות', letters: 'הכל', placeInWord: 'הכל', voice: 'גבר' };
function openExercise(state = settings) {
  return render(<ThemeProvider theme={theme}><MemoryRouter initialEntries={[{ pathname: '/ExercisePage', state }]}><ExercisePage /></MemoryRouter></ThemeProvider>);
}
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

test.each(['גבר', 'אישה'])('opens API exercise and plays the selected %s recording', async (voice) => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  const play = jest.fn().mockResolvedValue();
  const audio = jest.spyOn(window, 'Audio').mockImplementation(() => ({ play }));
  getMinimalPairs.mockResolvedValue([{ id: 1, words: [
    { text: 'צב', imageUrl: 'https://example.com/turtle.png', maleAudioUrl: 'https://example.com/male.wav', femaleAudioUrl: 'https://example.com/female.wav' },
    { text: 'תו', imageUrl: 'https://example.com/note.png' },
  ] }]);
  openExercise({ ...settings, voice });
  expect(await screen.findByAltText('צב')).toHaveAttribute('src', 'https://example.com/turtle.png');
  expect(getMinimalPairs).toHaveBeenCalledWith('קוליות', 'הכל', 'הכל');
  expect(screen.getByAltText('תו')).toHaveAttribute('src', 'https://example.com/note.png');
  expect(screen.queryByRole('button', { name: 'התחל' })).not.toBeInTheDocument();
  expect(audio).toHaveBeenCalledWith(voice === 'גבר' ? 'https://example.com/male.wav' : 'https://example.com/female.wav');
  expect(play).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'השמעה חוזרת' }));
  expect(audio).toHaveBeenCalledWith(voice === 'גבר' ? 'https://example.com/male.wav' : 'https://example.com/female.wav');
  expect(play).toHaveBeenCalledTimes(2);
});

test('empty results disable starting instead of crashing', async () => {
  getMinimalPairs.mockResolvedValue([]);
  openExercise();
  expect(await screen.findByText('לא נמצאו זוגות מתאימים להגדרות שבחרתם.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'השמעה חוזרת' })).toBeDisabled();
});

test('direct navigation asks for settings instead of reading missing state', async () => {
  openExercise(null);
  expect(await screen.findByRole('alert')).toHaveTextContent('בחרו הגדרות תרגול');
  expect(screen.getByRole('button', { name: 'השמעה חוזרת' })).toBeDisabled();
});

test('API errors are visible and prevent starting', async () => {
  getMinimalPairs.mockRejectedValue(new Error('השרת אינו זמין'));
  openExercise();
  expect(await screen.findByRole('alert')).toHaveTextContent('השרת אינו זמין');
  expect(screen.getByRole('button', { name: 'השמעה חוזרת' })).toBeDisabled();
});

const exercisePairs = [
  { id: 11, words: [{ text: 'צב' }, { text: 'תו' }] },
  { id: 22, words: [{ text: 'סיר' }, { text: 'שיר' }] },
];

function prepareSummaryExercise() {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  jest.spyOn(window, 'Audio').mockImplementation(() => ({ play: jest.fn().mockResolvedValue() }));
  jest.spyOn(console, 'log').mockImplementation(() => {});
  getMinimalPairs.mockResolvedValue(exercisePairs);
}

test('completion counts repeated mistakes once per pair and logs the exact child summary without saving', async () => {
  jest.useFakeTimers();
  prepareSummaryExercise();
  openExercise({ ...settings, childId: 7, childName: 'נועה לוי' });
  await screen.findByAltText('צב');
  fireEvent.click(screen.getByAltText('תו'));
  act(() => jest.advanceTimersByTime(2000));
  fireEvent.click(screen.getByAltText('תו'));
  act(() => jest.advanceTimersByTime(2000));
  fireEvent.click(screen.getByAltText('צב'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'הבא' }));
  fireEvent.click(screen.getByAltText('סיר'));

  const dialog = await screen.findByRole('dialog', { name: 'התרגול הסתיים!' });
  expect(dialog).toHaveAttribute('dir', 'rtl');
  expect(within(dialog).getByText('נועה לוי')).toBeInTheDocument();
  expect(within(dialog).getByRole('group', { name: 'סה״כ זוגות' })).toHaveTextContent('2');
  expect(within(dialog).getByRole('group', { name: 'זוגות עם טעויות' })).toHaveTextContent('1');
  expect(within(dialog).getByRole('group', { name: 'זוגות ללא טעויות' })).toHaveTextContent('1');
  expect(within(dialog).getAllByRole('listitem')).toHaveLength(1);
  expect(within(dialog).getByRole('listitem')).toHaveTextContent('צב / תו');
  fireEvent.click(within(dialog).getByRole('button', { name: 'שמירת התרגול' }));
  expect(console.log).toHaveBeenCalledWith('Exercise summary (not persisted):', {
    isCompleted: true,
    childId: 7, childName: 'נועה לוי', exerciseType: 'קוליות', soundPair: 'הכל',
    positionInWord: 'הכל', voice: 'גבר', totalPairs: 2, pairsWithMistakes: 1,
    pairsWithoutMistakes: 1, incompletePairs: 0, mistakenPairs: [{ id: 11, words: ['צב', 'תו'] }],
  });
});

test('skipped pairs are not completed and guests never see a history action', async () => {
  prepareSummaryExercise();
  openExercise();
  await screen.findByAltText('צב');
  fireEvent.click(screen.getByRole('button', { name: 'הבא' }));
  expect(screen.getByRole('button', { name: 'סיכום התרגול' })).toBeEnabled();
  fireEvent.click(screen.getByAltText('סיר'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'הקודם' }));
  fireEvent.click(screen.getByAltText('צב'));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).queryByRole('button', { name: 'שמירת התרגול' })).not.toBeInTheDocument();
  expect(within(dialog).queryByText('לשמור את התרגול בהיסטוריה של הילד?')).not.toBeInTheDocument();
  expect(within(dialog).getByText('לא היו טעויות בתרגול הזה!')).toBeInTheDocument();
  expect(within(dialog).getByRole('group', { name: 'זוגות ללא טעויות' })).toHaveTextContent('2');
});

test('mistakes survive revisiting a pair and declining the summary does not log it', async () => {
  jest.useFakeTimers();
  prepareSummaryExercise();
  openExercise({ ...settings, childId: 7, childName: 'נועה' });
  await screen.findByAltText('צב');
  fireEvent.click(screen.getByAltText('תו'));
  act(() => jest.advanceTimersByTime(2000));
  fireEvent.click(screen.getByRole('button', { name: 'הבא' }));
  fireEvent.click(screen.getByAltText('סיר'));
  fireEvent.click(screen.getByRole('button', { name: 'הקודם' }));
  fireEvent.click(screen.getByAltText('צב'));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByRole('group', { name: 'זוגות עם טעויות' })).toHaveTextContent('1');
  console.log.mockClear();
  fireEvent.click(within(dialog).getByRole('button', { name: 'לא עכשיו' }));
  expect(console.log).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(4000));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('manual preview allows continuing, preserves mistakes, and offers saving only after completion', async () => {
  jest.useFakeTimers();
  prepareSummaryExercise();
  openExercise({ ...settings, childId: 7, childName: 'נועה' });
  await screen.findByAltText('צב');
  fireEvent.click(screen.getByRole('button', { name: 'הבא' }));
  fireEvent.click(screen.getByAltText('שיר'));
  fireEvent.click(screen.getByRole('button', { name: 'סיכום התרגול' }));
  const dialog = await screen.findByRole('dialog', { name: 'סיכום ביניים' });
  expect(within(dialog).queryByRole('button', { name: 'שמירת התרגול' })).not.toBeInTheDocument();
  expect(within(dialog).queryByText('לשמור את התרגול בהיסטוריה של הילד?')).not.toBeInTheDocument();
  expect(within(dialog).getByRole('group', { name: 'זוגות ללא טעויות' })).toHaveTextContent('0');
  expect(within(dialog).getByText('זוגות שלא הושלמו: 2')).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'סגירה' }));
  act(() => jest.advanceTimersByTime(2000));
  fireEvent.click(screen.getByAltText('שיר'));
  act(() => jest.advanceTimersByTime(2000));
  fireEvent.click(screen.getByAltText('סיר'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'הקודם' }));
  fireEvent.click(screen.getByAltText('צב'));
  const completed = await screen.findByRole('dialog', { name: 'התרגול הסתיים!' });
  expect(within(completed).getByRole('button', { name: 'שמירת התרגול' })).toBeEnabled();
  expect(within(completed).getByRole('group', { name: 'זוגות עם טעויות' })).toHaveTextContent('1');
  expect(within(completed).getByRole('group', { name: 'זוגות ללא טעויות' })).toHaveTextContent('1');
  expect(within(completed).getAllByRole('listitem')).toHaveLength(1);
  expect(within(completed).getByRole('listitem')).toHaveTextContent('סיר / שיר');
});
