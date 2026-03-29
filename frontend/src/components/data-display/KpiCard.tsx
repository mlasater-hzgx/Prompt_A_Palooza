import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  subtitle?: string;
  onClick?: () => void;
}

export function KpiCard({ title, value, trend, trendValue, subtitle, onClick }: KpiCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : TrendingFlat;
  const trendColor = trend === 'down' ? '#1E6B38' : trend === 'up' ? '#AB2D24' : '#6D6E71';

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: '4px solid #FFD100',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: '1.1rem !important' }}>
        <Typography
          sx={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'text.secondary',
            letterSpacing: '0.03em',
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '2rem',
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trendColor }}>
              <TrendIcon sx={{ fontSize: '1rem' }} />
              {trendValue && (
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: trendColor }}>
                  {trendValue}
                </Typography>
              )}
            </Box>
          )}
        </Box>
        {subtitle && (
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
