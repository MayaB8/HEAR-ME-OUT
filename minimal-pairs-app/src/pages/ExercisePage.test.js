import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import ExercisePage from './ExercisePage';
import { getWordsFromDB, downloadImageFromStorage } from '../Firebase';

jest.mock('../Firebase');
const settings = { category: 'קוליות', letters: 'הכל', placeInWord: 'הכל', voice: 'גבר' };
function openExercise(state = settings) {
  return render(<ThemeProvider theme={theme}><MemoryRouter initialEntries={[{ pathname: '/ExercisePage', state }]}><ExercisePage /></MemoryRouter></ThemeProvider>);
}
afterEach(() => jest.restoreAllMocks());

test('opens Firebase exercise directly and plays the selected recording on request', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  const play = jest.fn().mockResolvedValue();
  const audio = jest.spyOn(window, 'Audio').mockImplementation(() => ({ play }));
  downloadImageFromStorage.mockImplementation(async path => path);
  getWordsFromDB.mockResolvedValue([{ id: 1, words: [
    { word: 'צב', photo_paths: 'https://example.com/turtle.png', man_sound_path: 'https://example.com/male.wav' },
    { word: 'תו', photo_paths: 'https://example.com/note.png', woman_sound_path: 'https://example.com/female.wav' },
  ] }]);
  openExercise();
  expect(await screen.findByAltText('צב')).toHaveAttribute('src', 'https://example.com/turtle.png');
  expect(getWordsFromDB).toHaveBeenCalledWith('קוליות', 'הכל', 'הכל');
  expect(screen.getByAltText('תו')).toHaveAttribute('src', 'https://example.com/note.png');
  expect(screen.queryByRole('button', { name: 'התחל' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'השמעה חוזרת' }));
  expect(audio).toHaveBeenCalledWith('https://example.com/male.wav');
  expect(play).toHaveBeenCalledTimes(1);
});

test('empty results disable starting instead of crashing', async () => {
  getWordsFromDB.mockResolvedValue([]);
  openExercise();
  expect(await screen.findByText('לא נמצאו זוגות מתאימים להגדרות שבחרתם.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'השמעה חוזרת' })).toBeDisabled();
});

test('direct navigation asks for settings instead of reading missing state', async () => {
  openExercise(null);
  expect(await screen.findByRole('alert')).toHaveTextContent('בחרו הגדרות תרגול');
  expect(screen.getByRole('button', { name: 'השמעה חוזרת' })).toBeDisabled();
});

test('Firebase errors are visible and prevent starting', async () => {
  getWordsFromDB.mockRejectedValue(new Error('השרת אינו זמין'));
  openExercise();
  expect(await screen.findByRole('alert')).toHaveTextContent('השרת אינו זמין');
  expect(screen.getByRole('button', { name: 'השמעה חוזרת' })).toBeDisabled();
});
