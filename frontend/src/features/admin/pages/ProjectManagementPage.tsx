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
  FormControlLabel,
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { DIVISIONS } from '../../../config/constants';
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

interface Project {
  id: string;
  projectNumber: string;
  name: string;
  division: string;
  isActive: boolean;
}

interface ProjectFormState {
  projectNumber: string;
  name: string;
  division: string;
  isActive: boolean;
}

/* ---------- Constants ---------- */

const EMPTY_FORM: ProjectFormState = {
  projectNumber: '',
  name: '',
  division: '',
  isActive: true,
};

/* ---------- API hooks ---------- */

function useProjects() {
  return useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/projects');
      return data;
    },
  });
}

function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ProjectFormState) => {
      const { data } = await apiClient.post('/admin/projects', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
    },
  });
}

function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & ProjectFormState) => {
      const { data } = await apiClient.put(`/admin/projects/${id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
    },
  });
}

/* ---------- Main Component ---------- */

export function Component() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);

  const { data, isLoading, isError, error } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const projects: Project[] = data?.data ?? data ?? [];

  const openAdd = useCallback(() => {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setForm({
      projectNumber: project.projectNumber,
      name: project.name,
      division: project.division,
      isActive: project.isActive,
    });
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingProject(null);
    setForm(EMPTY_FORM);
  }, []);

  const handleSave = useCallback(() => {
    const onSuccess = () => closeDialog();
    if (editingProject) {
      updateProject.mutate({ id: editingProject.id, ...form }, { onSuccess });
    } else {
      createProject.mutate(form, { onSuccess });
    }
  }, [editingProject, form, updateProject, createProject, closeDialog]);

  const isSaving = createProject.isPending || updateProject.isPending;

  return (
    <PageContainer
      title="Project Management"
      actions={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add Project
        </Button>
      }
    >
      {/* Loading / Error */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load projects. {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project #</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Division</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No projects configured</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{project.projectNumber}</Typography>
                      </TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>
                        {DIVISIONS.find((d) => d.value === project.division)?.label ?? project.division}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={project.isActive ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openEdit(project)}>
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue }}>
          {editingProject ? 'Edit Project' : 'Add Project'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Project Number"
              fullWidth
              value={form.projectNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, projectNumber: e.target.value }))}
            />
            <TextField
              label="Project Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Division</InputLabel>
              <Select
                label="Division"
                value={form.division}
                onChange={(e) => setForm((prev) => ({ ...prev, division: e.target.value }))}
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
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  color="success"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || !form.projectNumber || !form.name || !form.division}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
