import { Box, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotifIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { SyncStatusIndicator } from '../feedback/SyncStatusIndicator';
import { DevUserSwitcher } from '../auth/DevUserSwitcher';
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { ROLE_LABELS, type RoleName } from '../../config/roles';

export function TopBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { setSidebarMobileOpen, themeMode, toggleTheme } = useUiStore();
  const { user } = useAuthStore();

  return (
    <Box
      component="header"
      sx={{
        height: 56,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 2,
      }}
    >
      {isMobile && (
        <IconButton onClick={() => setSidebarMobileOpen(true)} aria-label="Open navigation menu">
          <MenuIcon />
        </IconButton>
      )}

      <DevUserSwitcher />

      <Box sx={{ flexGrow: 1 }} />

      <SyncStatusIndicator />

      <Tooltip title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
        <IconButton onClick={toggleTheme} aria-label="Toggle dark mode">
          {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon sx={{ color: '#FFD100' }} />}
        </IconButton>
      </Tooltip>

      <IconButton aria-label="Notifications">
        <NotifIcon />
      </IconButton>

      {user && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Roboto', sans-serif",
              fontWeight: 600,
              fontSize: '0.82rem',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Box>
          {!isMobile && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                {user.name}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', lineHeight: 1.2 }}>
                {ROLE_LABELS[user.role as RoleName] ?? user.role}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
