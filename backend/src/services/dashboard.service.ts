import { prisma } from '../config/database';
import { Division, IncidentStatus } from '@prisma/client';

export async function getExecutiveDashboard(dateRange?: { startDate?: string; endDate?: string }) {
  const where: Record<string, unknown> = {};
  if (dateRange?.startDate) where.incidentDate = { ...((where.incidentDate as object) ?? {}), gte: new Date(dateRange.startDate) };
  if (dateRange?.endDate) where.incidentDate = { ...((where.incidentDate as object) ?? {}), lte: new Date(dateRange.endDate) };

  const [
    totalIncidents,
    recordableIncidents,
    dartCases,
    nearMisses,
    openInvestigations,
    openCapas,
    recentIncidents,
    lostWorkDays,
  ] = await Promise.all([
    prisma.incident.count({ where }),
    prisma.incident.count({ where: { ...where, isOshaRecordable: true } }),
    prisma.incident.count({ where: { ...where, isDart: true } }),
    prisma.incident.count({ where: { ...where, incidentType: 'NEAR_MISS' } }),
    prisma.investigation.count({ where: { status: { in: ['NOT_STARTED', 'IN_PROGRESS', 'PENDING_REVIEW'] } } }),
    prisma.capa.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS', 'OVERDUE'] } } }),
    prisma.incident.findMany({
      where,
      orderBy: { incidentDate: 'desc' },
      take: 10,
      select: {
        id: true, incidentNumber: true, title: true, incidentType: true,
        severity: true, status: true, incidentDate: true, division: true,
      },
    }),
    prisma.incident.aggregate({
      where,
      _sum: { daysAway: true },
    }),
  ]);

  // Get hours worked for TRIR/DART calculation
  const hoursWorked = await prisma.hoursWorked.aggregate({ _sum: { hours: true } });
  const totalHours = Number(hoursWorked._sum.hours ?? 0);

  const trir = totalHours > 0 ? (recordableIncidents * 200000) / totalHours : 0;
  const dartRate = totalHours > 0 ? (dartCases * 200000) / totalHours : 0;
  const nearMissRatio = totalIncidents > 0 ? nearMisses / totalIncidents : 0;

  // Get industry benchmark from system config
  const benchmarkConfig = await prisma.systemConfig.findUnique({ where: { key: 'trir_industry_benchmark' } });
  const trirBenchmark = benchmarkConfig?.value as number | null;

  return {
    kpis: {
      trir: Math.round(trir * 100) / 100,
      trirBenchmark: trirBenchmark ?? null,
      dartRate: Math.round(dartRate * 100) / 100,
      nearMissRatio: Math.round(nearMissRatio * 100) / 100,
      lostWorkDays: lostWorkDays._sum.daysAway ?? 0,
      openInvestigations,
      openCapas,
      totalIncidents,
    },
    recentIncidents,
  };
}

export async function getDivisionDashboard(divisionId: string) {
  const division = divisionId as Division;

  const [divisionCount, companyCount, divisionRecordable, companyRecordable] = await Promise.all([
    prisma.incident.count({ where: { division } }),
    prisma.incident.count(),
    prisma.incident.count({ where: { division, isOshaRecordable: true } }),
    prisma.incident.count({ where: { isOshaRecordable: true } }),
  ]);

  const divisionHours = await prisma.hoursWorked.aggregate({ where: { division }, _sum: { hours: true } });
  const companyHours = await prisma.hoursWorked.aggregate({ _sum: { hours: true } });

  const dh = Number(divisionHours._sum.hours ?? 0);
  const ch = Number(companyHours._sum.hours ?? 0);

  return {
    division: divisionId,
    divisionTrir: dh > 0 ? Math.round((divisionRecordable * 200000 / dh) * 100) / 100 : 0,
    companyTrir: ch > 0 ? Math.round((companyRecordable * 200000 / ch) * 100) / 100 : 0,
    divisionIncidents: divisionCount,
    companyIncidents: companyCount,
  };
}

export async function getProjectDashboard(projectNumber: string) {
  const incidents = await prisma.incident.count({ where: { projectNumber } });
  const recordable = await prisma.incident.count({ where: { projectNumber, isOshaRecordable: true } });
  const openCapas = await prisma.capa.count({
    where: { incident: { projectNumber }, status: { in: ['OPEN', 'IN_PROGRESS'] } },
  });

  return { projectNumber, totalIncidents: incidents, recordableIncidents: recordable, openCapas };
}
