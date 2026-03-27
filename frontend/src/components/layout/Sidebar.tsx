import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ReportProblem as IncidentIcon,
  Search as InvestigationIcon,
  Assignment as CapaIcon,
  Loop as RecurrenceIcon,
  TrendingUp as TrendsIcon,
  Description as ReportsIcon,
  Settings as AdminIcon,
  People as UsersIcon,
  Category as FactorsIcon,
  Schedule as HoursIcon,
  Business as ProjectsIcon,
  Tune as ConfigIcon,
  NotificationsActive as NotifRulesIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { ROLE_NAV_ACCESS, type RoleName } from '../../config/roles';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  section: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, section: 'dashboard' },
  { label: 'Incidents', path: '/incidents', icon: <IncidentIcon />, section: 'incidents' },
  { label: 'Investigations', path: '/investigations', icon: <InvestigationIcon />, section: 'investigations' },
  { label: 'CAPA', path: '/capa', icon: <CapaIcon />, section: 'capa' },
  { label: 'Recurrence', path: '/recurrence', icon: <RecurrenceIcon />, section: 'recurrence' },
  { label: 'Trends', path: '/dashboard/trends', icon: <TrendsIcon />, section: 'trends' },
  { label: 'OSHA Reports', path: '/reports/osha', icon: <ReportsIcon />, section: 'reports' },
  {
    label: 'Admin', path: '/admin', icon: <AdminIcon />, section: 'admin',
    children: [
      { label: 'Users', path: '/admin/users', icon: <UsersIcon />, section: 'admin' },
      { label: 'Factor Library', path: '/admin/factors', icon: <FactorsIcon />, section: 'admin' },
      { label: 'Projects', path: '/admin/projects', icon: <ProjectsIcon />, section: 'admin' },
      { label: 'Hours Worked', path: '/admin/hours-worked', icon: <HoursIcon />, section: 'admin' },
      { label: 'Notifications', path: '/admin/notifications', icon: <NotifRulesIcon />, section: 'admin' },
      { label: 'System Config', path: '/admin/settings', icon: <ConfigIcon />, section: 'admin' },
    ],
  },
];

export function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, setSidebarMobileOpen } = useUiStore();
  const { user } = useAuthStore();
  const [adminOpen, setAdminOpen] = useState(location.pathname.startsWith('/admin'));

  const userRole = (user?.role ?? 'FIELD_REPORTER') as RoleName;
  const allowedSections = ROLE_NAV_ACCESS[userRole] ?? ['dashboard', 'incidents'];
  const filteredItems = navItems.filter((item) => allowedSections.includes(item.section as never));

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        bgcolor: '#000000', // Rich Black
        color: '#A7A9AC', // Smoke
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          sx={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            color: '#FFD100', // Herzog Gold
            fontSize: '1.4rem',
            letterSpacing: '0.08em',
            display: sidebarCollapsed && !isMobile ? 'none' : 'block',
          }}
        >
          HERZOG
        </Typography>
        {!isMobile && (
          <IconButton onClick={toggleSidebar} sx={{ color: '#A7A9AC' }}>
            {sidebarCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: '#58595B' }} />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {filteredItems.map((item) => {
          const active = isActive(item.path);
          const showExpanded = !sidebarCollapsed || isMobile;

          // Item with children (Admin section)
          if (item.children && showExpanded) {
            const anyChildActive = item.children.some((c) => isActive(c.path));
            return (
              <Box key={item.path}>
                <ListItemButton
                  onClick={() => setAdminOpen(!adminOpen)}
                  sx={{
                    mx: 1,
                    borderRadius: '4px',
                    borderLeft: anyChildActive ? '3px solid #FFD100' : '3px solid transparent',
                    color: anyChildActive ? '#FFD100' : '#A7A9AC',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' },
                    '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 40 },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontFamily: "'Roboto', sans-serif", fontWeight: anyChildActive ? 600 : 400, fontSize: '0.875rem' }}
                  />
                  <ExpandMoreIcon sx={{ fontSize: 18, transform: adminOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </ListItemButton>
                <Collapse in={adminOpen} timeout="auto">
                  <List disablePadding>
                    {item.children.map((child) => {
                      const childActive = isActive(child.path);
                      return (
                        <ListItemButton
                          key={child.path}
                          onClick={() => {
                            navigate(child.path);
                            if (isMobile) setSidebarMobileOpen(false);
                          }}
                          sx={{
                            mx: 1,
                            ml: 3,
                            borderRadius: '4px',
                            borderLeft: childActive ? '3px solid #FFD100' : '3px solid transparent',
                            color: childActive ? '#FFD100' : '#A7A9AC',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' },
                            '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 32 },
                            py: 0.5,
                          }}
                        >
                          <ListItemIcon sx={{ '& .MuiSvgIcon-root': { fontSize: '1.1rem' } }}>{child.icon}</ListItemIcon>
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{ fontFamily: "'Roboto', sans-serif", fontWeight: childActive ? 600 : 400, fontSize: '0.8rem' }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          }

          // Regular item (no children)
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                if (item.children) {
                  setAdminOpen(!adminOpen);
                } else {
                  navigate(item.path);
                  if (isMobile) setSidebarMobileOpen(false);
                }
              }}
              sx={{
                mx: 1,
                borderRadius: '4px',
                borderLeft: active ? '3px solid #FFD100' : '3px solid transparent',
                color: active ? '#FFD100' : '#A7A9AC',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' },
                '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 40 },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {showExpanded && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontFamily: "'Roboto', sans-serif", fontWeight: active ? 600 : 400, fontSize: '0.875rem' }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Version */}
      {(!sidebarCollapsed || isMobile) && (
        <Typography sx={{ p: 2, fontSize: '0.7rem', color: '#A7A9AC' }}>
          v1.0.0
        </Typography>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        open={sidebarMobileOpen}
        onClose={() => setSidebarMobileOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 220 } }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: sidebarCollapsed ? 64 : 220,
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: theme.zIndex.drawer,
        transition: 'width 0.2s',
        overflow: 'hidden',
      }}
    >
      {sidebarContent}
    </Box>
  );
}
