import { createTheme } from '@mui/material/styles';
import { colors } from './tokens/colors';
import { typography } from './tokens/typography';

export const herzogTheme = createTheme({
  palette: {
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
    error: {
      main: colors.semantic.error,
      light: colors.semantic.errorLight,
    },
    warning: {
      main: colors.semantic.warning,
      light: colors.semantic.warningLight,
    },
    success: {
      main: colors.semantic.success,
      light: colors.semantic.successLight,
    },
    info: {
      main: colors.semantic.info,
      light: colors.semantic.infoLight,
    },
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
  typography: {
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
  },
  shape: {
    borderRadius: 5,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '0.5rem 1rem',
          borderRadius: '5px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: colors.action.navyLight,
          },
        },
        containedSecondary: {
          color: colors.brand.richBlack,
          '&:hover': {
            backgroundColor: colors.brand.darkYellow,
          },
        },
        outlined: {
          borderColor: colors.neutral.borderGray,
          color: colors.brand.darkGray,
          '&:hover': {
            backgroundColor: colors.neutral.lightGray,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.neutral.borderGray}`,
          borderRadius: '8px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          },
        },
      },
    },
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
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.neutral.offWhite,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.neutral.inputBorder,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.action.navyBlue,
            borderWidth: '2px',
          },
        },
      },
    },
  },
});
