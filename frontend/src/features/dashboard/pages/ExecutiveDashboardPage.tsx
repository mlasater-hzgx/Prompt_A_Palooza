import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  TrendingFlat as TrendFlatIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { PageContainer } from '../../../components/layout/PageContainer';
import { useExecutiveDashboard, useTrirDartHistory } from '../api/dashboard.api';
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

interface KpiData {
  label: string;
  value: number | string;
  trend: 'up' | 'down' | 'flat';
  trendLabel?: string;
  benchmark?: number;
}

interface RecentIncident {
  id: string;
  incidentNumber: string;
  title: string;
  incidentType: string;
  severity: string;
  status: string;
  incidentDate: string;
}

interface TrirDataPoint {
  month: string;
  trir: number;
  benchmark?: number;
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

function getSeverityChipColor(severity: string): 'error' | 'warning' | 'info' | 'success' | 'default' {
  switch (severity) {
    case 'FATALITY':
    case 'LOST_TIME':
    case 'RESTRICTED_DUTY':
      return 'error';
    case 'MEDICAL_TREATMENT':
      return 'warning';
    case 'FIRST_AID':
      return 'info';
    case 'NEAR_MISS':
      return 'success';
    default:
      return 'default';
  }
}

function getStatusChipColor(status: string): 'success' | 'error' | 'warning' | 'info' | 'default' {
  switch (status) {
    case 'CLOSED':
      return 'success';
    case 'REOPENED':
      return 'error';
    case 'UNDER_INVESTIGATION':
    case 'CAPA_IN_PROGRESS':
      return 'warning';
    case 'REPORTED':
    case 'INVESTIGATION_COMPLETE':
    case 'CAPA_ASSIGNED':
      return 'info';
    default:
      return 'default';
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '--';
  }
}

/* ---------- Sub-components ---------- */

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
  const { data: dashData, isLoading, isError, error } = useExecutiveDashboard();
  const { data: trirData } = useTrirDartHistory();

  if (isLoading) {
    return (
      <PageContainer title="Executive Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer title="Executive Dashboard">
        <Alert severity="error">
          Failed to load dashboard. {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      </PageContainer>
    );
  }

  // API returns { data: { kpis: {...}, recentIncidents: [...] } }
  const raw = dashData?.data ?? dashData ?? {};
  const kpiData = raw.kpis ?? raw;
  const recentRaw = raw.recentIncidents ?? [];

  const kpis: KpiData[] = [
    {
      label: 'TRIR',
      value: kpiData.trir ?? '--',
      trend: 'flat' as const,
      benchmark: kpiData.trirBenchmark as number | undefined,
    },
    {
      label: 'DART Rate',
      value: kpiData.dartRate ?? '--',
      trend: 'flat' as const,
    },
    {
      label: 'Near Miss Ratio',
      value: kpiData.nearMissRatio != null ? `${Math.round(kpiData.nearMissRatio * 100)}%` : '--',
      trend: 'flat' as const,
    },
    {
      label: 'Lost Work Days',
      value: kpiData.lostWorkDays ?? '--',
      trend: 'flat' as const,
    },
  ];

  const stats = [
    { label: 'Open Investigations', value: kpiData.openInvestigations ?? 0 },
    { label: 'Open CAPAs', value: kpiData.openCapas ?? 0 },
    { label: 'Total Incidents', value: kpiData.totalIncidents ?? 0 },
    { label: 'Recordable Incidents', value: kpiData.totalRecordable ?? (kpiData.totalIncidents ? Math.round(kpiData.trir * (kpiData.totalIncidents / 90)) : '--') },
  ];

  const recentIncidents: RecentIncident[] = recentRaw as RecentIncident[];
  const trirRaw = trirData?.data ?? trirData ?? [];
  const trirHistory: TrirDataPoint[] = (Array.isArray(trirRaw) ? trirRaw : []) as TrirDataPoint[];
  const trirBenchmark: number | undefined = kpiData.trirBenchmark as number | undefined;

  return (
    <PageContainer title="Executive Dashboard">
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

      {/* Charts + Recent Incidents */}
      <Grid container spacing={3}>
        {/* TRIR Trend Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography
              sx={{ ...oswald, textTransform: 'uppercase', mb: 2, color: colors.action.navyBlue }}
              variant="h6"
            >
              TRIR Trend
            </Typography>
            {trirHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trirHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral.borderGray} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="trir"
                    stroke={colors.action.navyBlue}
                    strokeWidth={2}
                    dot={{ fill: colors.action.navyBlue, r: 3 }}
                  />
                  {trirBenchmark !== undefined && (
                    <ReferenceLine
                      y={trirBenchmark}
                      stroke={colors.brand.herzogGold}
                      strokeDasharray="6 4"
                      label={{ value: 'Benchmark', fill: colors.brand.darkYellow, fontSize: 11 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                <Typography color="text.secondary">No trend data available</Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Recent Incidents */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ p: 2, pb: 0 }}>
              <Typography
                sx={{ ...oswald, textTransform: 'uppercase', color: colors.action.navyBlue }}
                variant="h6"
              >
                Recent Incidents
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 340 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentIncidents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No recent incidents</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentIncidents.slice(0, 10).map((inc) => (
                      <TableRow key={inc.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {inc.incidentNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                            {inc.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{inc.incidentType}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={inc.severity}
                            size="small"
                            color={getSeverityChipColor(inc.severity)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={inc.status}
                            size="small"
                            color={getStatusChipColor(inc.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDate(inc.incidentDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
