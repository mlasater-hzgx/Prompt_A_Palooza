import { prisma } from '../config/database';
import { Division } from '@prisma/client';

const SEVERITY_WEIGHTS: Record<string, number> = {
  FATALITY: 100,
  LOST_TIME: 50,
  RESTRICTED_DUTY: 25,
  MEDICAL_TREATMENT: 10,
  FIRST_AID: 1,
  NEAR_MISS: 0.5,
  PROPERTY_ONLY: 0.5,
};

interface RateResult {
  trir: number;
  dartRate: number;
  severityWeightedRate: number;
  totalRecordable: number;
  totalDart: number;
  totalHoursWorked: number;
  weightedSum: number;
}

export async function calculateRates(options?: {
  division?: Division;
  projectNumber?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<RateResult> {
  const incidentWhere: Record<string, unknown> = {};
  const hoursWhere: Record<string, unknown> = {};

  if (options?.division) {
    incidentWhere.division = options.division;
    hoursWhere.division = options.division;
  }
  if (options?.projectNumber) {
    incidentWhere.projectNumber = options.projectNumber;
  }
  if (options?.startDate || options?.endDate) {
    incidentWhere.incidentDate = {};
    if (options?.startDate) (incidentWhere.incidentDate as Record<string, unknown>).gte = options.startDate;
    if (options?.endDate) (incidentWhere.incidentDate as Record<string, unknown>).lte = options.endDate;

    // Filter hours by year/month range matching the date range
    const hoursDateFilter: Record<string, unknown>[] = [];
    if (options?.startDate) {
      hoursDateFilter.push({
        OR: [
          { year: { gt: options.startDate.getFullYear() } },
          {
            year: options.startDate.getFullYear(),
            month: { gte: options.startDate.getMonth() + 1 },
          },
        ],
      });
    }
    if (options?.endDate) {
      hoursDateFilter.push({
        OR: [
          { year: { lt: options.endDate.getFullYear() } },
          {
            year: options.endDate.getFullYear(),
            month: { lte: options.endDate.getMonth() + 1 },
          },
        ],
      });
    }
    if (hoursDateFilter.length > 0) {
      hoursWhere.AND = hoursDateFilter;
    }
  }

  const [recordable, dart, incidents, hoursAgg] = await Promise.all([
    prisma.incident.count({ where: { ...incidentWhere, isOshaRecordable: true } }),
    prisma.incident.count({ where: { ...incidentWhere, isDart: true } }),
    prisma.incident.findMany({
      where: { ...incidentWhere, severity: { not: null } },
      select: { severity: true },
    }),
    prisma.hoursWorked.aggregate({ where: hoursWhere, _sum: { hours: true } }),
  ]);

  const totalHours = Number(hoursAgg._sum.hours ?? 0);
  let weightedSum = 0;
  for (const inc of incidents) {
    weightedSum += SEVERITY_WEIGHTS[inc.severity!] ?? 0;
  }

  return {
    trir: totalHours > 0 ? Math.round((recordable * 200000 / totalHours) * 100) / 100 : 0,
    dartRate: totalHours > 0 ? Math.round((dart * 200000 / totalHours) * 100) / 100 : 0,
    severityWeightedRate: totalHours > 0 ? Math.round((weightedSum / (totalHours / 200000)) * 100) / 100 : 0,
    totalRecordable: recordable,
    totalDart: dart,
    totalHoursWorked: totalHours,
    weightedSum,
  };
}

export async function getMonthlyRates(months = 12, division?: Division) {
  const history: Array<{ month: string; trir: number; dartRate: number; severityWeightedRate: number }> = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const monthStr = startDate.toISOString().slice(0, 7);

    const rates = await calculateRates({ division, startDate, endDate });
    history.push({
      month: monthStr,
      trir: rates.trir,
      dartRate: rates.dartRate,
      severityWeightedRate: rates.severityWeightedRate,
    });
  }

  return history;
}
