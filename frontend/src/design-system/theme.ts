import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { colors } from './tokens/colors';
import { typography } from './tokens/typography';

// Shared typography and shape
const sharedTypography: ThemeOptions['typography'] = {
  fontFamily: typography.fontFamily.body,
  h1: {
    fontFamily: typography.fontFamily.heading,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.wide,
    fontSize: typography.fontSize['2xl'],
  },
  h2: {
    fontFamily: typography.fontFamily.heading,
    fontWeight: typography.fontWeight.semiBold,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.tight,
    fontSize: typography.fontSize.xl,
  },
  h3: {
    fontFamily: typography.fontFamily.heading,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.tight,
    fontSize: typography.fontSize.lg,
  },
  body1: {
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.regular,
    fontSize: typography.fontSize.sm,
  },
  body2: {
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.regular,
    fontSize: typography.fontSize.xs,
  },
  button: {
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.semiBold,
    fontSize: typography.fontSize.sm,
    textTransform: 'none' as const,
  },
};

const sharedShape: ThemeOptions['shape'] = { borderRadius: 5 };

const sharedChip: ThemeOptions['components'] = {
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: typography.fontWeight.semiBold,
        fontSize: typography.fontSize.xs,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.03em',
        borderRadius: '3px',
        height: 'auto',
        padding: '0.15rem 0.6rem',
      },
    },
  },
};

// ─── Light Theme ───────────────────────────────────────────────────────────────

export const herzogLightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.action.navyBlue,
      light: colors.action.navyLight,
      dark: colors.action.navyDark,
      contrastText: colors.neutral.white,
    },
    secondary: {
      main: colors.brand.herzogGold,
      dark: colors.brand.darkYellow,
      contrastText: colors.brand.richBlack,
    },
    error: { main: colors.semantic.error, light: colors.semantic.errorLight },
    warning: { main: colors.semantic.warning, light: colors.semantic.warningLight },
    success: { main: colors.semantic.success, light: colors.semantic.successLight },
    info: { main: colors.semantic.info, light: colors.semantic.infoLight },
    background: {
      default: colors.neutral.lightGray,
      paper: colors.neutral.white,
    },
    text: {
      primary: colors.brand.darkGray,
      secondary: colors.brand.midGray,
      disabled: colors.brand.smoke,
    },
    divider: colors.neutral.borderGray,
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: {
    ...sharedChip,
    MuiButton: {
      styleOverrides: {
        root: { padding: '0.5rem 1rem', borderRadius: '5px' },
        containedPrimary: { '&:hover': { backgroundColor: colors.action.navyLight } },
        containedSecondary: { color: colors.brand.richBlack, '&:hover': { backgroundColor: colors.brand.darkYellow } },
        outlined: { borderColor: colors.neutral.borderGray, color: colors.brand.darkGray, '&:hover': { backgroundColor: colors.neutral.lightGray } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.neutral.borderGray}`,
          borderRadius: '8px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.neutral.offWhite,
          '& .MuiTableCell-root': {
            fontWeight: typography.fontWeight.semiBold,
            fontSize: typography.fontSize.xs,
            textTransform: 'uppercase' as const,
            color: colors.brand.midGray,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: { root: { '&:hover': { backgroundColor: colors.neutral.offWhite } } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.neutral.inputBorder },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.action.navyBlue, borderWidth: '2px' },
        },
      },
    },
  },
});

// ─── Dark Theme ────────────────────────────────────────────────────────────────

export const herzogDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.action.navyLight,       // Lighter navy for contrast on dark bg
      light: '#4A7ABF',
      dark: colors.action.navyBlue,
      contrastText: colors.neutral.white,
    },
    secondary: {
      main: colors.brand.herzogGold,
      dark: colors.brand.darkYellow,
      contrastText: colors.brand.richBlack,
    },
    error: { main: '#E05550', light: '#3D1A18' },
    warning: { main: '#D4A03C', light: '#3D3018' },
    success: { main: '#4CAF7A', light: '#1A3D28' },
    info: { main: '#4DB6C4', light: '#183038' },
    background: {
      default: '#0A0F1A',                   // Deep dark
      paper: colors.action.navyDark,        // #0F1F33
    },
    text: {
      primary: '#EAEAEA',                   // Near white
      secondary: colors.brand.smoke,        // #A7A9AC
      disabled: '#5A5C5E',
    },
    divider: '#2A3A50',
  },
  typography: {
    ...sharedTypography,
    h1: { ...sharedTypography?.h1 as object, color: '#EAEAEA' },
    h2: { ...sharedTypography?.h2 as object, color: '#EAEAEA' },
    h3: { ...sharedTypography?.h3 as object, color: '#EAEAEA' },
  },
  shape: sharedShape,
  components: {
    ...sharedChip,
    MuiButton: {
      styleOverrides: {
        root: { padding: '0.5rem 1rem', borderRadius: '5px' },
        containedPrimary: { backgroundColor: colors.action.navyLight, '&:hover': { backgroundColor: '#4A7ABF' } },
        containedSecondary: { color: colors.brand.richBlack, '&:hover': { backgroundColor: colors.brand.darkYellow } },
        outlined: { borderColor: '#2A3A50', color: '#EAEAEA', '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.action.navyDark,
          border: '1px solid #2A3A50',
          borderRadius: '8px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.3)' },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A1525',
          '& .MuiTableCell-root': {
            fontWeight: typography.fontWeight.semiBold,
            fontSize: typography.fontSize.xs,
            textTransform: 'uppercase' as const,
            color: colors.brand.smoke,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: { root: { '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' } } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: '#2A3A50' } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3A4A60' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.brand.herzogGold, borderWidth: '2px' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundColor: colors.action.navyDark, border: '1px solid #2A3A50' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { border: '1px solid #2A3A50' },
      },
    },
  },
});

// Backward compat export
export const herzogTheme = herzogLightTheme;
