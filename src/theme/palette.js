import { colors } from '@mui/material';

const white = '#FFFFFF';

export default {
  primary: {
    contrastText: white,
    dark: '#0F3164',
    main: '#1CA6FC',
    light: colors.blue[500]
  },
  secondary: {
    contrastText: white,
    dark: '#1CA6FC',
    main: '#0F3164',
    light: colors.blue[500]
  },
  error: {
    contrastText: white,
    dark: colors.red[900],
    main: colors.red[600],
    light: colors.red[400]
  },
  text: {
    primary: colors.blueGrey[900],
    secondary: colors.blueGrey[600],
    link: colors.blue[600]
  },
  link: colors.blue[800],
  icon: colors.blueGrey[600],
  background: {
    default: '#F4F6F8',
    paper: white
  },
  divider: colors.grey[200]
};
