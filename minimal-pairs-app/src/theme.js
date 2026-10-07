import { createTheme } from '@mui/material/styles';
import AssistantURL from './fonts/Assistant-Regular.ttf';
import AssistantRegularURL from './fonts/Assistant-Regular.woff';
import AssistantRegular2URL from './fonts/Assistant-Regular.woff2';
const theme = createTheme({
  palette: {
    black: '#000000',
    white: '#FFFFFF',
    darkBlue: '#1C4755',
    redOrange: '#F66747',
    yellow: '#EFC458',
    green: '#00A087',
    lightBlue: '#C2E3F3',
  },
  typography: {
    fontFamily: 'Assistant, Calibri, Arial'
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [
          {
            fontFamily: 'Assistant',
            src: `url(${AssistantURL}) format('truetype')`, // TTF format
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
          {
            fontFamily: 'Assistant',
            src: `url(${AssistantRegularURL}) format('woff')`, // WOFF format
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
          {
            fontFamily: 'Assistant',
            src: `url(${AssistantRegular2URL}) format('woff2')`, // WOFF format
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
        ],
      },
    },
  },
});

export default theme;
