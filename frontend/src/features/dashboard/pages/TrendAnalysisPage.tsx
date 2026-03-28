import {
  Box,
  Card,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { PageContainer } from '../../../components/layout/PageContainer';
import {
  useIncidentTrends,
  useSeverityDistribution,
  useContributingFactors,
  useLeadingIndicators,
} from '../api/dashboard.api';
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

interface TrendPoint {
  month: string;
  [key: string]: string | number;
}

interface SeveritySlice {
  name: string;
  value: number;
}

interface FactorBar {
  name: string;
  count: number;
}

interface LeadingIndicatorBar {
  name: string;
  actual: number;
  target: number;
}

/* ---------- Constants ---------- */

const oswald: React.CSSProperties = { fontFamily: 'Oswald, sans-serif' };

const AREA_KEYS = [
  { key: 'INJURY', label: 'Injury', color: colors.dataViz[4] ?? colors.semantic.error },
  { key: 'NEAR_MISS', label: 'Near Miss', color: colors.dataViz[3] ?? colors.semantic.success },
  { key: 'PROPERTY_DAMAGE', label: 'Property Damage', color: colors.dataViz[0] ?? colors.action.navyBlue },
  { key: 'ENVIRONMENTAL', label: 'Environmental', color: colors.dataViz[1] ?? colors.semantic.info },
  { key: 'VEHICLE', label: 'Vehicle', color: colors.dataViz[5] ?? '#6B4C9A' },
  { key: 'FIRE', label: 'Fire', color: colors.dataViz[6] ?? colors.semantic.warning },
  { key: 'UTILITY_STRIKE', label: 'Utility Strike', color: colors.dataViz[7] ?? '#4A6274' },
];

const PIE_COLORS = [
  colors.dataViz[0] ?? '#1E3A5F',
  colors.dataViz[4] ?? '#AB2D24',
  colors.dataViz[6] ?? '#8A5700',
  colors.dataViz[1] ?? '#086670',
  colors.dataViz[3] ?? '#1E6B38',
  colors.dataViz[7] ?? '#4A6274',
  colors.dataViz[5] ?? '#6B4C9A',
];

/* ---------- Chart Wrapper ---------- */

function ChartCard({
  title,
  children,
  minHeight = 320,
}: {
  title: string;
  children: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Typography
        sx={{
          ...oswald,
          textTransform: 'uppercase',
          mb: 2,
          color: colors.action.navyBlue,
          letterSpacing: 0.5,
        }}
        variant="h6"
      >
        {title}
      </Typography>
      <Box sx={{ minHeight }}>{children}</Box>
    </Card>
  );
}

/* ---------- Main Component ---------- */

export function Component() {
  const { data: trendsData, isLoading: trendsLoading, isError: trendsError } = useIncidentTrends();
  const { data: severityData, isLoading: sevLoading } = useSeverityDistribution();
  const { data: factorsData, isLoading: factorsLoading } = useContributingFactors();
  const { data: leadingData, isLoading: leadingLoading } = useLeadingIndicators();

  const trends: TrendPoint[] =
    (trendsData?.data as TrendPoint[] | undefined) ?? (trendsData as TrendPoint[] | undefined) ?? [];
  const severityRaw = ((severityData?.data ?? severityData ?? []) as any[]);
  const severity: SeveritySlice[] = severityRaw.map((s: any) => ({
    name: (s.severity ?? s.name ?? 'Unknown').replace(/_/g, ' '),
    value: s.count ?? s.value ?? 0,
  }));
  const factors: FactorBar[] =
    (factorsData?.data as FactorBar[] | undefined) ?? (factorsData as FactorBar[] | undefined) ?? [];
  const leadingRaw = (leadingData?.data ?? leadingData ?? {}) as Record<string, number | null>;
  const leading: LeadingIndicatorBar[] = [
    { name: 'Near Miss Rate', actual: leadingRaw.nearMissRate ?? 0, target: leadingRaw.nearMissRateTarget ?? 0 },
    { name: 'CAPA Closure', actual: leadingRaw.capaClosureRate ?? 0, target: leadingRaw.capaClosureRateTarget ?? 0 },
    { name: 'Investigation Timeliness', actual: leadingRaw.investigationTimeliness ?? 0, target: leadingRaw.investigationTimelinessTarget ?? 0 },
  ].filter((l) => l.actual > 0 || l.target > 0);

  const isLoading = trendsLoading || sevLoading || factorsLoading || leadingLoading;

  if (isLoading) {
    return (
      <PageContainer title="Trend Analysis">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (trendsError) {
    return (
      <PageContainer title="Trend Analysis">
        <Alert severity="error">Failed to load trend data. Please try again.</Alert>
      </PageContainer>
    );
  }

  // Compute the max target value for leading indicators reference line
  const maxTarget = leading.length > 0 ? Math.max(...leading.map((l) => l.target)) : 0;

  return (
    <PageContainer title="Trend Analysis">
      <Grid container spacing={3}>
        {/* Incident Type Trend - Stacked Area */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Incident Type Trend (12 Months)">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral.borderGray} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {AREA_KEYS.map((ak) => (
                    <Area
                      key={ak.key}
                      type="monotone"
                      dataKey={ak.key}
                      name={ak.label}
                      stackId="1"
                      stroke={ak.color}
                      fill={ak.color}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        </Grid>

        {/* Severity Distribution - Donut */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Severity Distribution">
            {severity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severity}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }: { name: string; percent: number }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine
                  >
                    {severity.map((_entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        </Grid>

        {/* Contributing Factor Frequency - Horizontal Bar */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Contributing Factors (Top 10)" minHeight={360}>
            {factors.length > 0 ? (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={factors.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral.borderGray} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={colors.action.navyBlue} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        </Grid>

        {/* Leading Indicators - Bar with Target Line */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Leading Indicators" minHeight={360}>
            {leading.length > 0 ? (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={leading}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral.borderGray} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="actual" name="Actual" fill={colors.action.navyBlue} />
                  <Bar dataKey="target" name="Target" fill={colors.brand.herzogGold} />
                  {maxTarget > 0 && (
                    <ReferenceLine
                      y={maxTarget}
                      stroke={colors.semantic.error}
                      strokeDasharray="6 4"
                      label={{
                        value: `Max Target: ${maxTarget}`,
                        fill: colors.semantic.error,
                        fontSize: 11,
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

function EmptyState() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Typography color="text.secondary">No data available</Typography>
    </Box>
  );
}
