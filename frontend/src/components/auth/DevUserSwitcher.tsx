import { useState, useEffect } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Typography,
  Chip,
  type SelectChangeEvent,
} from '@mui/material';
import { SwapHoriz as SwitchIcon } from '@mui/icons-material';
import { apiClient, setDevUserId } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth.store';
import { ROLE_LABELS, type RoleName } from '../../config/roles';
import { queryClient } from '../../lib/query-client';

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
  division: string | null;
}

const ROLE_COLORS: Record<string, string> = {
  ADMINISTRATOR: '#6B4C9A',
  SAFETY_MANAGER: '#1E3A5F',
  SAFETY_COORDINATOR: '#086670',
  FIELD_REPORTER: '#1E6B38',
  PROJECT_MANAGER: '#8A5700',
  DIVISION_MANAGER: '#AB2D24',
  EXECUTIVE: '#000000',
};

export function DevUserSwitcher() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const { user, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    async function loadUsers() {
      try {
        const { data } = await apiClient.get('/users?pageSize=50');
        setUsers(data.data ?? []);
      } catch {
        // ignore
      }
    }
    loadUsers();
  }, []);

  async function handleSwitch(event: SelectChangeEvent<string>) {
    const userId = event.target.value;
    setDevUserId(userId || null);

    // Reload current user
    try {
      const { data } = await apiClient.get('/users/me');
      setUser(data.data);
      // Invalidate all queries so data reflects new role's permissions
      queryClient.invalidateQueries();
    } catch {
      setLoading(true);
    }
  }

  if (users.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: '#FFF3CD',
        border: '1px solid #F1B80E',
        borderRadius: '5px',
        px: 1.5,
        py: 0.5,
      }}
      className="no-print"
    >
      <SwitchIcon sx={{ fontSize: 18, color: '#8A5700' }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#8A5700', whiteSpace: 'nowrap' }}>
        DEV
      </Typography>
      <Select
        value={user?.id ?? ''}
        onChange={handleSwitch}
        size="small"
        variant="standard"
        disableUnderline
        sx={{
          fontSize: '0.82rem',
          fontWeight: 500,
          minWidth: 180,
          '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', gap: 1 },
        }}
        renderValue={(selected) => {
          const u = users.find((u) => u.id === selected);
          if (!u) return 'Select user...';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>{u.name}</span>
              <Chip
                label={ROLE_LABELS[u.role as RoleName] ?? u.role}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  bgcolor: `${ROLE_COLORS[u.role] ?? '#58595B'}18`,
                  color: ROLE_COLORS[u.role] ?? '#58595B',
                }}
              />
            </Box>
          );
        }}
      >
        {users.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{u.name}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#6D6E71' }}>{u.email}</Typography>
              </Box>
              <Chip
                label={ROLE_LABELS[u.role as RoleName] ?? u.role}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  bgcolor: `${ROLE_COLORS[u.role] ?? '#58595B'}18`,
                  color: ROLE_COLORS[u.role] ?? '#58595B',
                }}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
