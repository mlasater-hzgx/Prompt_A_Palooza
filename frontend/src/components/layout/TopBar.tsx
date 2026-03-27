import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotifIcon } from '@mui/icons-material';
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';

export function TopBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { setSidebarMobileOpen } = useUiStore();
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

      <Box sx={{ flexGrow: 1 }} />

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
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.name}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
