import { PrismaClient, Division } from '@prisma/client';

interface HoursWorkedSeed {
  division: Division | null;
  year: number;
  month: number;
  hours: number;
}

// ============================================================================
// Monthly hours worked by division for Oct 2024 - Mar 2026 (18 months)
//
// HCC: ~120 employees, averages ~22,000 hours/month (higher in summer)
// HRSI: ~80 employees, averages ~15,000 hours/month (higher in summer)
// HSI: ~40 employees, averages ~7,000 hours/month
// Company-wide null entries aggregate total for TRIR calculations
//
// HCC has a notably higher incident rate per hours worked than HRSI
// due to the Track 7 walkway pattern and UP KC project issues.
// ============================================================================

const HOURS_DATA: HoursWorkedSeed[] = [
  // ── October 2024 ───────────────────────────────────────────────────────
  { division: 'HCC', year: 2024, month: 10, hours: 22400 },
  { division: 'HRSI', year: 2024, month: 10, hours: 15200 },
  { division: 'HSI', year: 2024, month: 10, hours: 7100 },
  { division: null, year: 2024, month: 10, hours: 44700 },

  // ── November 2024 ──────────────────────────────────────────────────────
  { division: 'HCC', year: 2024, month: 11, hours: 20800 },
  { division: 'HRSI', year: 2024, month: 11, hours: 14600 },
  { division: 'HSI', year: 2024, month: 11, hours: 6800 },
  { division: null, year: 2024, month: 11, hours: 42200 },

  // ── December 2024 ──────────────────────────────────────────────────────
  { division: 'HCC', year: 2024, month: 12, hours: 18500 },
  { division: 'HRSI', year: 2024, month: 12, hours: 13200 },
  { division: 'HSI', year: 2024, month: 12, hours: 5900 },
  { division: null, year: 2024, month: 12, hours: 37600 },

  // ── January 2025 ───────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 1, hours: 19200 },
  { division: 'HRSI', year: 2025, month: 1, hours: 13800 },
  { division: 'HSI', year: 2025, month: 1, hours: 6200 },
  { division: null, year: 2025, month: 1, hours: 39200 },

  // ── February 2025 ──────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 2, hours: 19800 },
  { division: 'HRSI', year: 2025, month: 2, hours: 14000 },
  { division: 'HSI', year: 2025, month: 2, hours: 6400 },
  { division: null, year: 2025, month: 2, hours: 40200 },

  // ── March 2025 ─────────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 3, hours: 21600 },
  { division: 'HRSI', year: 2025, month: 3, hours: 14800 },
  { division: 'HSI', year: 2025, month: 3, hours: 6900 },
  { division: null, year: 2025, month: 3, hours: 43300 },

  // ── April 2025 ─────────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 4, hours: 23200 },
  { division: 'HRSI', year: 2025, month: 4, hours: 15600 },
  { division: 'HSI', year: 2025, month: 4, hours: 7300 },
  { division: null, year: 2025, month: 4, hours: 46100 },

  // ── May 2025 ───────────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 5, hours: 24800 },
  { division: 'HRSI', year: 2025, month: 5, hours: 16400 },
  { division: 'HSI', year: 2025, month: 5, hours: 7800 },
  { division: null, year: 2025, month: 5, hours: 49000 },

  // ── June 2025 ──────────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 6, hours: 25600 },
  { division: 'HRSI', year: 2025, month: 6, hours: 17000 },
  { division: 'HSI', year: 2025, month: 6, hours: 8200 },
  { division: null, year: 2025, month: 6, hours: 50800 },

  // ── July 2025 ──────────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 7, hours: 25200 },
  { division: 'HRSI', year: 2025, month: 7, hours: 16800 },
  { division: 'HSI', year: 2025, month: 7, hours: 8000 },
  { division: null, year: 2025, month: 7, hours: 50000 },

  // ── August 2025 ────────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 8, hours: 24400 },
  { division: 'HRSI', year: 2025, month: 8, hours: 16200 },
  { division: 'HSI', year: 2025, month: 8, hours: 7700 },
  { division: null, year: 2025, month: 8, hours: 48300 },

  // ── September 2025 ─────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 9, hours: 23600 },
  { division: 'HRSI', year: 2025, month: 9, hours: 15800 },
  { division: 'HSI', year: 2025, month: 9, hours: 7500 },
  { division: null, year: 2025, month: 9, hours: 46900 },

  // ── October 2025 ───────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 10, hours: 22800 },
  { division: 'HRSI', year: 2025, month: 10, hours: 15400 },
  { division: 'HSI', year: 2025, month: 10, hours: 7200 },
  { division: null, year: 2025, month: 10, hours: 45400 },

  // ── November 2025 ──────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 11, hours: 21000 },
  { division: 'HRSI', year: 2025, month: 11, hours: 14400 },
  { division: 'HSI', year: 2025, month: 11, hours: 6600 },
  { division: null, year: 2025, month: 11, hours: 42000 },

  // ── December 2025 ──────────────────────────────────────────────────────
  { division: 'HCC', year: 2025, month: 12, hours: 18800 },
  { division: 'HRSI', year: 2025, month: 12, hours: 13000 },
  { division: 'HSI', year: 2025, month: 12, hours: 5800 },
  { division: null, year: 2025, month: 12, hours: 37600 },

  // ── January 2026 ───────────────────────────────────────────────────────
  { division: 'HCC', year: 2026, month: 1, hours: 19600 },
  { division: 'HRSI', year: 2026, month: 1, hours: 13600 },
  { division: 'HSI', year: 2026, month: 1, hours: 6100 },
  { division: null, year: 2026, month: 1, hours: 39300 },

  // ── February 2026 ──────────────────────────────────────────────────────
  { division: 'HCC', year: 2026, month: 2, hours: 20200 },
  { division: 'HRSI', year: 2026, month: 2, hours: 14200 },
  { division: 'HSI', year: 2026, month: 2, hours: 6500 },
  { division: null, year: 2026, month: 2, hours: 40900 },

  // ── March 2026 (partial - through 3/27) ────────────────────────────────
  { division: 'HCC', year: 2026, month: 3, hours: 17800 },
  { division: 'HRSI', year: 2026, month: 3, hours: 12400 },
  { division: 'HSI', year: 2026, month: 3, hours: 5600 },
  { division: null, year: 2026, month: 3, hours: 35800 },
];

export async function seedHoursWorked(prisma: PrismaClient) {
  for (const hw of HOURS_DATA) {
    await prisma.hoursWorked.create({
      data: {
        division: hw.division,
        year: hw.year,
        month: hw.month,
        hours: hw.hours,
      },
    });
  }
}
