import { Chip } from '@mui/material';
import { SEVERITY_LEVELS } from '../../config/constants';

interface SeverityIndicatorProps {
  severity: string | null | undefined;
}

export function SeverityIndicator({ severity }: SeverityIndicatorProps) {
  if (!severity) return <Chip label="N/A" size="small" sx={{ bgcolor: '#F5F5F5', color: '#6D6E71' }} />;

  const level = SEVERITY_LEVELS.find((s) => s.value === severity);
  const color = level?.color ?? '#58595B';

  return (
    <Chip
      label={level?.label ?? severity}
      size="small"
      sx={{
        bgcolor: `${color}15`,
        color,
        fontWeight: 600,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        borderRadius: '3px',
        border: `1px solid ${color}30`,
      }}
    />
  );
}
