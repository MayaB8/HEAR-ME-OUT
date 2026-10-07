import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import ExercisePage from './ExercisePage';
import { getMinimalPairs } from '../minimalPairsApi';

jest.mock('../minimalPairsApi');
const settings = { category: 'קוליות', letters: 'הכל', placeInWord: 'הכל', voice: 'גבר' };
function openExercise(state = settings) {
  return render(<ThemeProvider theme={theme}><MemoryRouter initialEntries={[{ pathname: '/ExercisePage', state }]}><ExercisePage /></MemoryRouter></ThemeProvider>);
}
afterEach(() => jest.restoreAllMocks());

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
