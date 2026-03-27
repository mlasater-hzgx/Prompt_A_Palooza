import { Box, LinearProgress, Typography } from '@mui/material';

interface CompletionProgressProps {
  value: number;
  showLabel?: boolean;
}

export function CompletionProgress({ value, showLabel = true }: CompletionProgressProps) {
  const color = value >= 90 ? '#1E6B38' : value >= 50 ? '#8A5700' : '#AB2D24';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          bgcolor: '#E5E5E5',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
      {showLabel && (
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color, minWidth: 35 }}>
          {value}%
        </Typography>
      )}
    </Box>
  );
}
