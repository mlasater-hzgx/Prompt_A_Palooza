import { useState } from 'react';
import { useParams } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  TrendingFlat as TrendFlatIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PageContainer } from '../../../components/layout/PageContainer';
import { useDivisionDashboard, useDivisionComparison } from '../api/dashboard.api';
import { DIVISIONS } from '../../../config/constants';
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

interface KpiData {
  label: string;
  value: number | string;
  trend: 'up' | 'down' | 'flat';
  trendLabel?: string;
  benchmark?: number;
}

interface ComparisonPoint {
  division: string;
  divisionTrir: number;
  companyTrir: number;
}

/* ---------- Helpers ---------- */

const oswald: React.CSSProperties = { fontFamily: 'Oswald, sans-serif' };

function TrendIndicator({ trend, label }: { trend: string; label?: string }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  const trendColor = isDown ? colors.semantic.success : isUp ? colors.semantic.error : colors.brand.midGray;
  const Icon = isUp ? TrendUpIcon : isDown ? TrendDownIcon : TrendFlatIcon;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Icon sx={{ fontSize: 18, color: trendColor }} />
      {label && (
        <Typography variant="caption" sx={{ color: trendColor }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}

function KpiCard({ kpi }: { kpi: KpiData }) {
  return (
    <Card
      sx={{
        borderLeft: `4px solid ${colors.brand.herzogGold}`,
        height: '100%',
      }}
    >
      <CardContent>
        <Typography
          variant="overline"
          sx={{ color: colors.brand.midGray, letterSpacing: 1, fontSize: '0.7rem' }}
        >
          {kpi.label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
          <Typography
            sx={{ ...oswald, fontSize: '2rem', fontWeight: 700, color: colors.action.navyBlue }}
          >
            {kpi.value}
          </Typography>
          <TrendIndicator trend={kpi.trend} label={kpi.trendLabel} />
        </Box>
        {kpi.benchmark !== undefined && (
          <Typography variant="caption" sx={{ color: colors.brand.midGray }}>
            Industry benchmark: {kpi.benchmark}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card
      sx={{
        borderLeft: `4px solid ${colors.brand.herzogGold}`,
        height: '100%',
      }}
    >
      <CardContent>
        <Typography
          variant="overline"
          sx={{ color: colors.brand.midGray, letterSpacing: 1, fontSize: '0.7rem' }}
        >
          {label}
        </Typography>
        <Typography
          sx={{ ...oswald, fontSize: '1.75rem', fontWeight: 700, color: colors.action.navyBlue, mt: 0.5 }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

/* ---------- Main Component ---------- */

export function Component() {
  const { divisionId: urlDivisionId } = useParams<{ divisionId: string }>();
  const [selectedDivision, setSelectedDivision] = useState(urlDivisionId ?? '');

  const activeDivision = selectedDivision || undefined;
  const { data: dashData, isLoading, isError, error } = useDivisionDashboard(activeDivision);
  const { data: comparisonData } = useDivisionComparison();

  const dashboard = dashData?.data ?? dashData ?? {};

  const kpis: KpiData[] = [
    {
      label: 'TRIR',
      value: dashboard.trir ?? '--',
      trend: (dashboard.trirTrend as 'up' | 'down' | 'flat') ?? 'flat',
      trendLabel: dashboard.trirTrendLabel as string | undefined,
      benchmark: dashboard.trirBenchmark as number | undefined,
    },
    {
      label: 'DART Rate',
      value: dashboard.dartRate ?? '--',
      trend: (dashboard.dartTrend as 'up' | 'down' | 'flat') ?? 'flat',
      trendLabel: dashboard.dartTrendLabel as string | undefined,
    },
    {
      label: 'Near Miss Ratio',
      value: dashboard.nearMissRatio ?? '--',
      trend: (dashboard.nearMissTrend as 'up' | 'down' | 'flat') ?? 'flat',
      trendLabel: dashboard.nearMissTrendLabel as string | undefined,
    },
    {
      label: 'Lost Work Days',
      value: dashboard.lostWorkDays ?? '--',
      trend: (dashboard.lostWorkDaysTrend as 'up' | 'down' | 'flat') ?? 'flat',
      trendLabel: dashboard.lostWorkDaysTrendLabel as string | undefined,
    },
  ];

  const stats = [
    { label: 'Open Investigations', value: dashboard.openInvestigations ?? 0 },
    { label: 'Open CAPAs', value: dashboard.openCapas ?? 0 },
    { label: 'Total Incidents (YTD)', value: dashboard.totalIncidents ?? 0 },
    { label: 'Recordable Rate', value: dashboard.recordableRate ?? '--' },
  ];

  const comparison: ComparisonPoint[] =
    (comparisonData?.data as ComparisonPoint[] | undefined) ??
    (comparisonData as ComparisonPoint[] | undefined) ??
    [];

  return (
    <PageContainer
      title="Division Dashboard"
      actions={
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Division</InputLabel>
          <Select
            label="Division"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            <MenuItem value="">Select Division</MenuItem>
            {DIVISIONS.map((d) => (
              <MenuItem key={d.value} value={d.value}>
                {d.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
    >
      {!activeDivision && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Select a division above to view its dashboard.
        </Alert>
      )}

      {isLoading && activeDivision && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load division dashboard.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {activeDivision && !isLoading && !isError && (
        <>
          {/* KPI Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {kpis.map((kpi) => (
              <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3 }}>
                <KpiCard kpi={kpi} />
              </Grid>
            ))}
          </Grid>

          {/* Stats Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {stats.map((s) => (
              <Grid key={s.label} size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard label={s.label} value={s.value} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Division vs Company TRIR Comparison */}
      <Card sx={{ p: 2 }}>
        <Typography
          sx={{ ...oswald, textTransform: 'uppercase', mb: 2, color: colors.action.navyBlue }}
          variant="h6"
        >
          Division vs Company TRIR
        </Typography>
        {comparison.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral.borderGray} />
              <XAxis dataKey="division" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="divisionTrir" name="Division TRIR" fill={colors.action.navyBlue} />
              <Bar dataKey="companyTrir" name="Company TRIR" fill={colors.brand.herzogGold} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
            <Typography color="text.secondary">No comparison data available</Typography>
          </Box>
        )}
      </Card>
    </PageContainer>
  );
}
