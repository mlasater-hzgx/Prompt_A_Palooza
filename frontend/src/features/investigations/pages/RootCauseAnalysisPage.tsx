import { useState, useCallback, type SyntheticEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Add as AddIcon,
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import {
  useInvestigation,
  useAddFiveWhy,
  useDeleteFiveWhy,
  useAddFishboneFactor,
  useDeleteFishboneFactor,
} from '../api/investigations.api';
import { colors } from '../../../design-system/tokens/colors';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_WHYS = 7;

const FISHBONE_CATEGORIES = [
  { value: 'PEOPLE', label: 'People', color: colors.dataViz[0] },
  { value: 'PROCESS', label: 'Process', color: colors.dataViz[1] },
  { value: 'EQUIPMENT', label: 'Equipment', color: colors.dataViz[2] },
  { value: 'MATERIALS', label: 'Materials', color: colors.dataViz[3] },
  { value: 'ENVIRONMENT', label: 'Environment', color: colors.dataViz[4] },
  { value: 'MANAGEMENT', label: 'Management', color: colors.dataViz[5] },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FiveWhyEntry {
  id: string;
  sequence: number;
  question: string;
  answer: string;
  evidence?: string;
}

interface FishboneFactor {
  id: string;
  category: string;
  description: string;
  isContributing: boolean;
  evidence?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

// ---------------------------------------------------------------------------
// 5-Why Tab
// ---------------------------------------------------------------------------

interface FiveWhyTabProps {
  investigationId: string;
  entries: FiveWhyEntry[];
}

function FiveWhyTab({ investigationId, entries }: FiveWhyTabProps) {
  const addWhy = useAddFiveWhy();
  const deleteWhy = useDeleteFiveWhy();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [evidence, setEvidence] = useState('');

  const sorted = [...entries].sort((a, b) => a.sequence - b.sequence);
  const canAdd = sorted.length < MAX_WHYS;

  const handleAdd = async () => {
    const nextSequence = sorted.length > 0
      ? (sorted[sorted.length - 1]?.sequence ?? 0) + 1
      : 1;
    await addWhy.mutateAsync({
      investigationId,
      sequence: nextSequence,
      question,
      answer,
      evidence: evidence || undefined,
    });
    setQuestion('');
    setAnswer('');
    setEvidence('');
    setDialogOpen(false);
  };

  const handleDelete = async (entryId: string) => {
    await deleteWhy.mutateAsync({ investigationId, entryId });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">5-Why Analysis</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={!canAdd || addWhy.isPending}
        >
          Add Why ({sorted.length}/{MAX_WHYS})
        </Button>
      </Box>

      {addWhy.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to add entry. Please try again.
        </Alert>
      )}

      {deleteWhy.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to delete entry. Please try again.
        </Alert>
      )}

      {sorted.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">
              No 5-Why entries yet. Click "Add Why" to begin the analysis.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sorted.map((entry) => (
            <Card key={entry.id} sx={{ position: 'relative' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: colors.action.navyBlue,
                      color: colors.neutral.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      flexShrink: 0,
                      mr: 2,
                    }}
                  >
                    {entry.sequence}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Question
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {entry.question}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Answer
                      </Typography>
                      <Typography variant="body1">{entry.answer}</Typography>
                    </Box>
                    {entry.evidence && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Evidence
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {entry.evidence}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Tooltip title="Delete entry">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteWhy.isPending}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add Why Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Why #{sorted.length + 1}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Question (Why?)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              fullWidth
              required
              placeholder="Why did this happen?"
            />
            <TextField
              label="Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              fullWidth
              required
              multiline
              rows={3}
              placeholder="Because..."
            />
            <TextField
              label="Evidence (optional)"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Supporting evidence, documents, observations..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={addWhy.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!question.trim() || !answer.trim() || addWhy.isPending}
          >
            {addWhy.isPending ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Fishbone Tab
// ---------------------------------------------------------------------------

interface FishboneTabProps {
  investigationId: string;
  factors: FishboneFactor[];
}

function FishboneTab({ investigationId, factors }: FishboneTabProps) {
  const addFactor = useAddFishboneFactor();
  const deleteFactor = useDeleteFishboneFactor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  const openDialog = (category: string) => {
    setSelectedCategory(category);
    setDescription('');
    setEvidence('');
    setIsContributing(false);
    setDialogOpen(true);
  };

  const handleAdd = async () => {
    await addFactor.mutateAsync({
      investigationId,
      category: selectedCategory,
      description,
      isContributing,
      evidence: evidence || undefined,
    });
    setDialogOpen(false);
  };

  const handleDelete = async (factorId: string) => {
    await deleteFactor.mutateAsync({ investigationId, factorId });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Fishbone (Ishikawa) Analysis</Typography>
        <Typography variant="body2" color="text.secondary">
          Categorize potential causes across six dimensions.
        </Typography>
      </Box>

      {addFactor.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to add factor. Please try again.
        </Alert>
      )}

      {deleteFactor.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to delete factor. Please try again.
        </Alert>
      )}

      <Grid container spacing={2}>
        {FISHBONE_CATEGORIES.map((cat) => {
          const catFactors = factors.filter((f) => f.category === cat.value);
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.value}>
              <Card
                sx={{
                  height: '100%',
                  borderTop: `4px solid ${cat.color}`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
                      {cat.label}
                    </Typography>
                    <Tooltip title={`Add factor to ${cat.label}`}>
                      <IconButton
                        size="small"
                        onClick={() => openDialog(cat.value)}
                        sx={{ color: cat.color }}
                        disabled={addFactor.isPending}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {catFactors.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic' }}
                    >
                      No factors identified.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {catFactors.map((factor) => (
                        <Box
                          key={factor.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            backgroundColor: factor.isContributing
                              ? colors.semantic.warningLight
                              : colors.neutral.lightGray,
                            border: factor.isContributing
                              ? `1px solid ${colors.brand.darkYellow}`
                              : `1px solid ${colors.neutral.borderGray}`,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {factor.description}
                              </Typography>
                              {factor.evidence && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block', mt: 0.5 }}
                                >
                                  Evidence: {factor.evidence}
                                </Typography>
                              )}
                              {factor.isContributing && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: colors.semantic.warning,
                                    fontWeight: 600,
                                    mt: 0.5,
                                    display: 'block',
                                  }}
                                >
                                  Contributing Factor
                                </Typography>
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(factor.id)}
                              disabled={deleteFactor.isPending}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add Factor Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Factor -{' '}
          {FISHBONE_CATEGORIES.find((c) => c.value === selectedCategory)?.label ?? ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              multiline
              rows={2}
              placeholder="Describe the potential cause..."
            />
            <TextField
              label="Evidence (optional)"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Supporting evidence..."
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isContributing}
                  onChange={(e) => setIsContributing(e.target.checked)}
                />
              }
              label="Mark as contributing factor"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={addFactor.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!description.trim() || addFactor.isPending}
          >
            {addFactor.isPending ? 'Adding...' : 'Add Factor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function Component() {
  const { investigationId } = useParams<{ investigationId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const { data, isLoading, isError, error } = useInvestigation(
    investigationId ?? '',
  );

  const investigation: Record<string, unknown> = data?.data ?? data ?? {};

  const handleTabChange = useCallback(
    (_: SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    },
    [],
  );

  // Loading
  if (isLoading) {
    return (
      <PageContainer title="Root Cause Analysis">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={48} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </PageContainer>
    );
  }

  // Error
  if (isError) {
    return (
      <PageContainer title="Root Cause Analysis">
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load investigation.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/investigations')}
        >
          Back to Investigations
        </Button>
      </PageContainer>
    );
  }

  const fiveWhyEntries = (investigation.fiveWhyEntries as FiveWhyEntry[]) ?? [];
  const fishboneFactors = (investigation.fishboneFactors as FishboneFactor[]) ?? [];

  const pageTitle = investigation.incidentNumber
    ? `Root Cause Analysis - ${investigation.incidentNumber}`
    : 'Root Cause Analysis';

  return (
    <PageContainer
      title={pageTitle}
      actions={
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() =>
            navigate(`/investigations/${investigationId ?? ''}`)
          }
        >
          Back to Investigation
        </Button>
      }
    >
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`5-Why (${fiveWhyEntries.length})`} />
          <Tab label={`Fishbone (${fishboneFactors.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <FiveWhyTab
          investigationId={investigationId ?? ''}
          entries={fiveWhyEntries}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <FishboneTab
          investigationId={investigationId ?? ''}
          factors={fishboneFactors}
        />
      </TabPanel>
    </PageContainer>
  );
}
