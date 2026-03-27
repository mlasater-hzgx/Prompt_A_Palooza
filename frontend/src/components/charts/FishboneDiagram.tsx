import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from '@mui/material';
import { AccountTree as DiagramIcon, TableChart as TableIcon } from '@mui/icons-material';

interface FishboneFactor {
  id: string;
  category: string;
  description: string;
  isContributing: boolean;
  evidence?: string | null;
}

interface FishboneDiagramProps {
  factors: FishboneFactor[];
}

const CATEGORIES = [
  { key: 'PEOPLE', label: 'People', color: '#1E3A5F' },
  { key: 'PROCESS', label: 'Process', color: '#086670' },
  { key: 'EQUIPMENT', label: 'Equipment', color: '#FFD100' },
  { key: 'MATERIALS', label: 'Materials', color: '#1E6B38' },
  { key: 'ENVIRONMENT', label: 'Environment', color: '#AB2D24' },
  { key: 'MANAGEMENT', label: 'Management', color: '#6B4C9A' },
];

export function FishboneDiagram({ factors }: FishboneDiagramProps) {
  const [view, setView] = useState<'diagram' | 'table'>('diagram');

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    factors: factors.filter((f) => f.category === cat.key),
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, val) => {
            if (val) setView(val);
          }}
          size="small"
          aria-label="View mode"
        >
          <ToggleButton value="diagram" aria-label="Diagram view">
            <DiagramIcon sx={{ mr: 0.5 }} /> Diagram
          </ToggleButton>
          <ToggleButton value="table" aria-label="Table view">
            <TableIcon sx={{ mr: 0.5 }} /> Table
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'diagram' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {grouped.map((cat) => (
            <Card key={cat.key} sx={{ borderTop: `4px solid ${cat.color}` }}>
              <Box sx={{ p: 2 }}>
                <Typography
                  sx={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    mb: 1,
                    color: cat.color,
                  }}
                >
                  {cat.label}
                </Typography>
                {cat.factors.length === 0 ? (
                  <Typography
                    sx={{
                      color: '#A7A9AC',
                      fontSize: '0.82rem',
                      fontStyle: 'italic',
                    }}
                  >
                    No factors
                  </Typography>
                ) : (
                  cat.factors.map((f) => (
                    <Box
                      key={f.id}
                      sx={{
                        p: 1,
                        mb: 0.5,
                        borderRadius: 1,
                        bgcolor: f.isContributing ? '#FFF3CD' : '#FAFAFA',
                        border: f.isContributing
                          ? '1px solid #F1B80E'
                          : '1px solid #E5E5E5',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.82rem',
                          fontWeight: f.isContributing ? 600 : 400,
                        }}
                      >
                        {f.description}
                        {f.isContributing && (
                          <Chip
                            label="Contributing"
                            size="small"
                            sx={{
                              ml: 1,
                              height: 18,
                              fontSize: '0.6rem',
                              bgcolor: '#FFD100',
                              color: '#000',
                            }}
                          />
                        )}
                      </Typography>
                      {f.evidence && (
                        <Typography
                          sx={{ fontSize: '0.72rem', color: '#6D6E71', mt: 0.5 }}
                        >
                          Evidence: {f.evidence}
                        </Typography>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        <TableContainer>
          <Table size="small" aria-label="Fishbone analysis factors">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Factor</TableCell>
                <TableCell>Contributing</TableCell>
                <TableCell>Evidence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {factors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No factors recorded
                  </TableCell>
                </TableRow>
              ) : (
                factors.map((f) => {
                  const cat = CATEGORIES.find((c) => c.key === f.category);
                  return (
                    <TableRow key={f.id}>
                      <TableCell>
                        <Chip
                          label={cat?.label ?? f.category}
                          size="small"
                          sx={{
                            bgcolor: `${cat?.color ?? '#58595B'}20`,
                            color: cat?.color ?? '#58595B',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>{f.description}</TableCell>
                      <TableCell>{f.isContributing ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{f.evidence ?? '\u2014'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
