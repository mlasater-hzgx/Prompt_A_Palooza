import { prisma } from '../config/database';

export async function getIncidentTrends(months = 12) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const incidents = await prisma.incident.findMany({
    where: { incidentDate: { gte: since } },
    select: { incidentDate: true, incidentType: true },
  });

  // Group by month and type
  const trends: Record<string, Record<string, number>> = {};
  for (const inc of incidents) {
    const month = inc.incidentDate.toISOString().slice(0, 7); // YYYY-MM
    if (!trends[month]) trends[month] = {};
    const type = inc.incidentType;
    trends[month][type] = (trends[month][type] ?? 0) + 1;
  }

  return Object.entries(trends)
    .map(([month, types]) => ({ month, ...types }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export async function getSeverityDistribution() {
  const result = await prisma.incident.groupBy({
    by: ['severity'],
    _count: { id: true },
    where: { severity: { not: null } },
  });
  return result.map((r) => ({ severity: r.severity, count: r._count.id }));
}

export async function getContributingFactorFrequency() {
  const factors = await prisma.contributingFactor.findMany({
    include: { factorType: { select: { name: true, category: true } } },
  });

  const freq: Record<string, { name: string; category: string; count: number }> = {};
  for (const f of factors) {
    const key = f.factorTypeId;
    if (!freq[key]) freq[key] = { name: f.factorType.name, category: f.factorType.category, count: 0 };
    freq[key].count++;
  }

  return Object.values(freq).sort((a, b) => b.count - a.count);
}

export async function getTimeOfDayHeatmap() {
  const incidents = await prisma.incident.findMany({
    where: { incidentTime: { not: null } },
    select: { incidentDate: true, incidentTime: true },
  });

  // Build 24x7 grid
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0) as number[]);
  for (const inc of incidents) {
    const dayOfWeek = inc.incidentDate.getDay();
    const hour = inc.incidentTime!.getHours();
    grid[dayOfWeek][hour]++;
  }

  return grid;
}

export async function getBodyPartFrequency() {
  const result = await prisma.injuredPerson.groupBy({
    by: ['bodyPart'],
    _count: { id: true },
    where: { bodyPart: { not: null } },
  });
  return result.map((r) => ({ bodyPart: r.bodyPart, count: r._count.id }));
}

export async function getDivisionComparison() {
  const divisions = ['HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'HERZOG_ENERGY', 'GREEN_GROUP'] as const;
  const result = await Promise.all(
    divisions.map(async (division) => {
      const [total, recordable, nearMiss, openCapas] = await Promise.all([
        prisma.incident.count({ where: { division } }),
        prisma.incident.count({ where: { division, isOshaRecordable: true } }),
        prisma.incident.count({ where: { division, incidentType: 'NEAR_MISS' } }),
        prisma.capa.count({ where: { incident: { division }, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      ]);
      return { division, totalIncidents: total, recordableIncidents: recordable, nearMisses: nearMiss, openCapas };
    })
  );
  return result;
}

export async function getLeadingIndicators() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalIncidents, nearMisses, completedCapas, totalCapas, completedInvestigations, totalInvestigations] =
    await Promise.all([
      prisma.incident.count({ where: { incidentDate: { gte: thirtyDaysAgo } } }),
      prisma.incident.count({ where: { incidentDate: { gte: thirtyDaysAgo }, incidentType: 'NEAR_MISS' } }),
      prisma.capa.count({ where: { status: { in: ['COMPLETED', 'VERIFICATION_PENDING', 'VERIFIED_EFFECTIVE'] } } }),
      prisma.capa.count(),
      prisma.investigation.count({ where: { status: 'COMPLETE' } }),
      prisma.investigation.count(),
    ]);

  // Get targets from system config
  const targets = await prisma.systemConfig.findMany({
    where: { key: { startsWith: 'leading_indicator_' } },
  });
  const targetMap: Record<string, number> = {};
  for (const t of targets) {
    targetMap[t.key] = t.value as number;
  }

  return {
    nearMissRate: totalIncidents > 0 ? Math.round((nearMisses / totalIncidents) * 100) : 0,
    nearMissRateTarget: targetMap['leading_indicator_near_miss_rate'] ?? null,
    capaClosureRate: totalCapas > 0 ? Math.round((completedCapas / totalCapas) * 100) : 0,
    capaClosureRateTarget: targetMap['leading_indicator_capa_closure'] ?? null,
    investigationTimeliness: totalInvestigations > 0 ? Math.round((completedInvestigations / totalInvestigations) * 100) : 0,
    investigationTimelinessTarget: targetMap['leading_indicator_investigation_timeliness'] ?? null,
  };
}

export async function getTrirDartHistory(months = 12) {
  const history: Array<{ month: string; trir: number; dartRate: number }> = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const monthStr = date.toISOString().slice(0, 7);

    const [recordable, dart] = await Promise.all([
      prisma.incident.count({
        where: { isOshaRecordable: true, incidentDate: { gte: date, lte: endDate } },
      }),
      prisma.incident.count({
        where: { isDart: true, incidentDate: { gte: date, lte: endDate } },
      }),
    ]);

    const hours = await prisma.hoursWorked.findFirst({
      where: { year: date.getFullYear(), month: date.getMonth() + 1, division: null },
    });

    const h = Number(hours?.hours ?? 0);
    history.push({
      month: monthStr,
      trir: h > 0 ? Math.round((recordable * 200000 / h) * 100) / 100 : 0,
      dartRate: h > 0 ? Math.round((dart * 200000 / h) * 100) / 100 : 0,
    });
  }

  return history;
}

export async function getSeverityWeightedRate() {
  const weights: Record<string, number> = {
    FATALITY: 100, LOST_TIME: 50, RESTRICTED_DUTY: 25,
    MEDICAL_TREATMENT: 10, FIRST_AID: 1, NEAR_MISS: 0.5, PROPERTY_ONLY: 0.5,
  };

  const incidents = await prisma.incident.findMany({
    where: { severity: { not: null } },
    select: { severity: true },
  });

  let weightedSum = 0;
  for (const inc of incidents) {
    weightedSum += weights[inc.severity!] ?? 0;
  }

  const hours = await prisma.hoursWorked.aggregate({ _sum: { hours: true } });
  const totalHours = Number(hours._sum.hours ?? 0);

  return {
    weightedSum,
    rate: totalHours > 0 ? Math.round((weightedSum / (totalHours / 200000)) * 100) / 100 : 0,
  };
}

export async function getCapaEffectiveness() {
  const result = await prisma.capa.groupBy({
    by: ['verificationResult'],
    _count: { id: true },
    where: { verificationResult: { not: null } },
  });
  return result.map((r) => ({ result: r.verificationResult, count: r._count.id }));
}

export async function getRecurrenceSummary() {
  const links = await prisma.recurrenceLink.groupBy({
    by: ['similarityType'],
    _count: { id: true },
    where: { isDismissed: false },
  });

  const totalLinks = await prisma.recurrenceLink.count({ where: { isDismissed: false } });
  const totalIncidentsWithRecurrence = await prisma.recurrenceLink.findMany({
    where: { isDismissed: false },
    select: { incidentId: true },
    distinct: ['incidentId'],
  });

  return {
    totalLinks,
    incidentsWithRecurrence: totalIncidentsWithRecurrence.length,
    bySimilarityType: links.map((l) => ({ type: l.similarityType, count: l._count.id })),
  };
}
