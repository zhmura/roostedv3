import { createTheme } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import overrides from './overrides';

const baseTheme = {
  palette,
  typography,
  overrides
};

export const theme = createTheme(baseTheme);
export const themeWithRtl = createTheme({ ...baseTheme, direction: 'rtl' });
