import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Print as PrintIcon, Description as ReportIcon } from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

type ReportType = 'OSHA_300' | 'OSHA_300A' | 'OSHA_301';

interface ReportColumn {
  key: string;
  label: string;
}

interface ReportResult {
  title: string;
  columns: ReportColumn[];
  rows: Record<string, string | number | boolean>[];
  summary?: Record<string, string | number>;
}

/* ---------- Constants ---------- */

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const REPORT_LABELS: Record<ReportType, string> = {
  OSHA_300: 'OSHA 300 - Log of Work-Related Injuries and Illnesses',
  OSHA_300A: 'OSHA 300A - Summary of Work-Related Injuries and Illnesses',
  OSHA_301: 'OSHA 301 - Injury and Illness Incident Report',
};

const oswald: React.CSSProperties = { fontFamily: 'Oswald, sans-serif' };

/* ---------- API hook ---------- */

const REPORT_ENDPOINTS: Record<ReportType, string> = {
  OSHA_300: '/reports/osha-300',
  OSHA_300A: '/reports/osha-300a',
  OSHA_301: '/reports/osha-301',
};

function useGenerateReport() {
  return useMutation({
    mutationFn: async ({ year, reportType }: { year: number; reportType: ReportType }) => {
      const endpoint = REPORT_ENDPOINTS[reportType];
      const { data } = await apiClient.get(`${endpoint}?year=${year}`);
      return data as { data: ReportResult } | ReportResult;
    },
  });
}

/* ---------- Main Component ---------- */

export function Component() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const generateReport = useGenerateReport();

  const handleGenerate = useCallback(
    (reportType: ReportType) => {
      setActiveReport(reportType);
      generateReport.mutate(
        { year: selectedYear, reportType },
        {
          onSuccess: (rawData) => {
            // API returns { data: [...] } for 300, { data: { ...summary } } for 300A
            const payload = (rawData as any)?.data ?? rawData;

            if (reportType === 'OSHA_300') {
              const rows = Array.isArray(payload) ? payload : [];
              setReportData({
                title: `OSHA 300 Log - ${selectedYear}`,
                columns: [
                  { key: 'caseNumber', label: 'Case #' },
                  { key: 'employeeName', label: 'Employee' },
                  { key: 'jobTitle', label: 'Job Title' },
                  { key: 'date', label: 'Date' },
                  { key: 'location', label: 'Location' },
                  { key: 'description', label: 'Description' },
                  { key: 'death', label: 'Death' },
                  { key: 'daysAway', label: 'Days Away' },
                  { key: 'daysRestricted', label: 'Days Restricted' },
                  { key: 'injuryType', label: 'Injury Type' },
                  { key: 'bodyPart', label: 'Body Part' },
                ],
                rows,
              });
            } else if (reportType === 'OSHA_300A') {
              const summary = Array.isArray(payload) ? {} : payload;
              setReportData({
                title: `OSHA 300A Summary - ${selectedYear}`,
                columns: [
                  { key: 'metric', label: 'Metric' },
                  { key: 'value', label: 'Value' },
                ],
                rows: Object.entries(summary)
                  .filter(([k]) => k !== 'year')
                  .map(([key, value]) => ({
                    metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim(),
                    value: value as string | number,
                  })),
                summary,
              });
            } else {
              // OSHA 301 - all recordable incidents for the year
              const rows = Array.isArray(payload) ? payload : [];
              setReportData({
                title: `OSHA 301 Incident Reports - ${selectedYear}`,
                columns: [
                  { key: 'incidentNumber', label: 'Incident #' },
                  { key: 'employeeName', label: 'Employee' },
                  { key: 'jobTitle', label: 'Job Title' },
                  { key: 'incidentDate', label: 'Date' },
                  { key: 'incidentTime', label: 'Time' },
                  { key: 'location', label: 'Location' },
                  { key: 'description', label: 'What Happened' },
                  { key: 'injuryDescription', label: 'Injury' },
                  { key: 'treatmentType', label: 'Treatment' },
                  { key: 'hospitalized', label: 'Hospitalized' },
                  { key: 'reportedBy', label: 'Reported By' },
                ],
                rows,
              });
            }
          },
          onError: () => {
            setReportData(null);
          },
        },
      );
    },
    [selectedYear, generateReport],
  );

  const handlePrint = useCallback(() => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${activeReport ? REPORT_LABELS[activeReport] : 'OSHA Report'} - ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 12px; }
            th { background-color: #1E3A5F; color: white; }
            h1 { font-family: Oswald, sans-serif; color: #1E3A5F; font-size: 20px; }
            h2 { font-size: 14px; color: #58595B; }
            .summary { margin-top: 16px; }
            .summary dt { font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${printRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }, [activeReport, selectedYear]);

  return (
    <PageContainer title="OSHA Reports">
      {/* Year Selector */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Year</InputLabel>
            <Select
              label="Year"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setReportData(null);
                setActiveReport(null);
              }}
            >
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Report Generation Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {(Object.keys(REPORT_LABELS) as ReportType[]).map((type) => (
          <Button
            key={type}
            variant={activeReport === type ? 'contained' : 'outlined'}
            startIcon={<ReportIcon />}
            onClick={() => handleGenerate(type)}
            disabled={generateReport.isPending}
            sx={{
              borderColor: colors.action.navyBlue,
              color: activeReport === type ? colors.neutral.white : colors.action.navyBlue,
              backgroundColor: activeReport === type ? colors.action.navyBlue : undefined,
              '&:hover': {
                backgroundColor:
                  activeReport === type ? colors.action.navyDark : 'rgba(30,58,95,0.08)',
              },
            }}
          >
            Generate {type.replace('_', ' ')}
          </Button>
        ))}
      </Box>

      {/* Loading */}
      {generateReport.isPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {generateReport.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to generate report.{' '}
          {generateReport.error instanceof Error
            ? generateReport.error.message
            : 'Please try again.'}
        </Alert>
      )}

      {/* Report Display */}
      {reportData && !generateReport.isPending && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{ ...oswald, color: colors.action.navyBlue, textTransform: 'uppercase' }}
                  variant="h6"
                >
                  {reportData.title || (activeReport ? REPORT_LABELS[activeReport] : 'Report')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calendar Year {selectedYear}
                </Typography>
              </Box>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                Print
              </Button>
            </Box>

            {/* Printable content */}
            <Box ref={printRef}>
              <h1 style={{ display: 'none' }}>
                {reportData.title ||
                  (activeReport ? REPORT_LABELS[activeReport] : 'Report')}{' '}
                - {selectedYear}
              </h1>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        '& th': {
                          backgroundColor: colors.action.navyBlue,
                          color: colors.neutral.white,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        },
                      }}
                    >
                      {reportData.columns.map((col) => (
                        <TableCell key={col.key}>{col.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={reportData.columns.length}
                          align="center"
                          sx={{ py: 4 }}
                        >
                          <Typography color="text.secondary">
                            No recordable incidents for {selectedYear}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData.rows.map((row, idx) => (
                        <TableRow key={idx} hover>
                          {reportData.columns.map((col) => (
                            <TableCell key={col.key}>
                              <Typography variant="body2">
                                {String(row[col.key] ?? '--')}
                              </Typography>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary Section (e.g., for OSHA 300A) */}
              {reportData.summary && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: colors.neutral.offWhite, borderRadius: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue, mb: 1 }}
                  >
                    Summary
                  </Typography>
                  <Box
                    component="dl"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                      gap: 1,
                      m: 0,
                      '& dt': { fontWeight: 600, fontSize: '0.85rem' },
                      '& dd': { ml: 0, mb: 1.5, fontSize: '0.85rem', color: colors.brand.midGray },
                    }}
                  >
                    {Object.entries(reportData.summary).map(([key, value]) => (
                      <Box key={key}>
                        <dt>{key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</dt>
                        <dd>{String(value)}</dd>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
