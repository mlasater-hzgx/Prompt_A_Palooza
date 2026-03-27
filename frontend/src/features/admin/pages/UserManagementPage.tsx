import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';
import { Search as SearchIcon, PersonAdd as AddUserIcon } from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { DIVISIONS } from '../../../config/constants';
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division: string;
  isActive: boolean;
}

interface EditFormState {
  role: string;
  division: string;
  isActive: boolean;
}

/* ---------- Constants ---------- */

const ROLES = [
  { value: 'FIELD_REPORTER', label: 'Field Reporter' },
  { value: 'SAFETY_COORDINATOR', label: 'Safety Coordinator' },
  { value: 'SAFETY_MANAGER', label: 'Safety Manager' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'DIVISION_MANAGER', label: 'Division Manager' },
  { value: 'EXECUTIVE', label: 'Executive' },
  { value: 'ADMINISTRATOR', label: 'Administrator' },
] as const;

const ROLE_COLORS: Record<string, string> = {
  ADMINISTRATOR: '#6B4C9A',
  SAFETY_MANAGER: '#1E3A5F',
  SAFETY_COORDINATOR: '#086670',
  FIELD_REPORTER: '#1E6B38',
  PROJECT_MANAGER: '#8A5700',
  DIVISION_MANAGER: '#AB2D24',
  EXECUTIVE: '#000000',
};

/* ---------- API hooks ---------- */

function useUsers(search: string) {
  return useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await apiClient.get(`/users${params}`);
      return data;
    },
  });
}

function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & EditFormState) => {
      const { data } = await apiClient.put(`/users/${id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await apiClient.put(`/users/${id}`, { isActive });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; email: string; role: string; division?: string }) => {
      const { data } = await apiClient.post('/users', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/* ---------- Main Component ---------- */

export function Component() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ role: '', division: '', isActive: true });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'FIELD_REPORTER', division: '' });

  const { data, isLoading, isError, error } = useUsers(appliedSearch);
  const updateUser = useUpdateUser();
  const toggleActive = useToggleUserActive();
  const createUser = useCreateUser();

  const users: User[] = data?.data ?? data ?? [];

  const handleSearch = useCallback(() => {
    setAppliedSearch(search);
  }, [search]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch],
  );

  const openEdit = useCallback((user: User) => {
    setEditUser(user);
    setEditForm({ role: user.role, division: user.division, isActive: user.isActive });
  }, []);

  const handleSave = useCallback(() => {
    if (!editUser) return;
    updateUser.mutate(
      { id: editUser.id, ...editForm },
      { onSuccess: () => setEditUser(null) },
    );
  }, [editUser, editForm, updateUser]);

  const handleToggleActive = useCallback(
    (user: User) => {
      toggleActive.mutate({ id: user.id, isActive: !user.isActive });
    },
    [toggleActive],
  );

  return (
    <PageContainer
      title="User Management"
      actions={
        <Button variant="contained" startIcon={<AddUserIcon />} onClick={() => { setAddForm({ name: '', email: '', role: 'FIELD_REPORTER', division: '' }); setAddOpen(true); }}>
          Add User
        </Button>
      }
    >
      {/* Search Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearch}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 300 }}
          />
          <Button variant="outlined" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </Card>

      {/* Loading / Error */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load users. {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Division</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{user.name}</Typography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={ROLES.find((r) => r.value === user.role)?.label ?? user.role}
                          size="small"
                          sx={{
                            bgcolor: `${ROLE_COLORS[user.role] ?? '#58595B'}18`,
                            color: ROLE_COLORS[user.role] ?? '#58595B',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {DIVISIONS.find((d) => d.value === user.division)?.label ?? user.division}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.isActive}
                          onChange={() => handleToggleActive(user)}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openEdit(user)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editUser !== null} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue }}>
          Edit User: {editUser?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={editForm.role}
                onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Division</InputLabel>
              <Select
                label="Division"
                value={editForm.division}
                onChange={(e) => setEditForm((prev) => ({ ...prev, division: e.target.value }))}
              >
                {DIVISIONS.map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  color="success"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateUser.isPending}
          >
            {updateUser.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue }}>
          Add User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Full Name"
              value={addForm.name}
              onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={addForm.role}
                onChange={(e) => setAddForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Division</InputLabel>
              <Select
                label="Division"
                value={addForm.division}
                onChange={(e) => setAddForm((prev) => ({ ...prev, division: e.target.value }))}
              >
                <MenuItem value="">None</MenuItem>
                {DIVISIONS.map((d) => (
                  <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!addForm.name || !addForm.email || createUser.isPending}
            onClick={() => {
              createUser.mutate(
                { name: addForm.name, email: addForm.email, role: addForm.role, division: addForm.division || undefined },
                { onSuccess: () => setAddOpen(false) },
              );
            }}
          >
            {createUser.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
