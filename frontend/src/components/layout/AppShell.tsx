import { Outlet } from 'react-router';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUiStore } from '../../store/ui.store';

export function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarCollapsed } = useUiStore();

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 64 : 220;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          ml: `${sidebarWidth}px`,
          transition: 'margin-left 0.2s',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <TopBar />
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, maxWidth: 1536, width: '100%', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
