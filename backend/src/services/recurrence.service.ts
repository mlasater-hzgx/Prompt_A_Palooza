import { prisma } from '../config/database';
import { Prisma, SimilarityType, DetectedBy } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

interface ManualLinkData {
  incidentId: string;
  relatedIncidentId: string;
  similarityType: SimilarityType;
  notes?: string;
}

export async function detectRecurrence(incidentId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      injuredPersons: { select: { employeeId: true, name: true } },
      contributingFactors: {
        where: { isPrimary: true },
        select: { factorTypeId: true },
      },
    },
  });
  if (!incident) throw new NotFoundError('Incident', incidentId);

  const links: Array<{
    incidentId: string;
    relatedIncidentId: string;
    similarityType: SimilarityType;
    detectedBy: DetectedBy;
    notes: string;
  }> = [];

  const now = new Date();

  // Rule 1: Same job site + same incident type within 12 months
  if (incident.jobSite) {
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const sameLocationType = await prisma.incident.findMany({
      where: {
        id: { not: incidentId },
        jobSite: incident.jobSite,
        incidentType: incident.incidentType,
        incidentDate: { gte: twelveMonthsAgo },
      },
      select: { id: true, incidentNumber: true },
    });

    for (const related of sameLocationType) {
      links.push({
        incidentId,
        relatedIncidentId: related.id,
        similarityType: 'SAME_LOCATION',
        detectedBy: 'SYSTEM',
        notes: `Same job site (${incident.jobSite}) and incident type (${incident.incidentType}) within 12 months`,
      });
    }
  }

  // Rule 2: Same primary contributing factor within 24 months
  if (incident.contributingFactors.length > 0) {
    const twentyFourMonthsAgo = new Date(now);
    twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);

    const primaryFactorIds = incident.contributingFactors.map((f) => f.factorTypeId);

    const sameRootCause = await prisma.incident.findMany({
      where: {
        id: { not: incidentId },
        incidentDate: { gte: twentyFourMonthsAgo },
        contributingFactors: {
          some: {
            isPrimary: true,
            factorTypeId: { in: primaryFactorIds },
          },
        },
      },
      select: { id: true, incidentNumber: true },
    });

    for (const related of sameRootCause) {
      links.push({
        incidentId,
        relatedIncidentId: related.id,
        similarityType: 'SAME_ROOT_CAUSE',
        detectedBy: 'SYSTEM',
        notes: 'Same primary contributing factor within 24 months',
      });
    }
  }

  // Rule 3: Same person (injured) - all time
  const employeeIds = incident.injuredPersons
    .map((p) => p.employeeId)
    .filter((eid): eid is string => eid != null);

  if (employeeIds.length > 0) {
    const samePerson = await prisma.incident.findMany({
      where: {
        id: { not: incidentId },
        injuredPersons: {
          some: {
            employeeId: { in: employeeIds },
          },
        },
      },
      select: { id: true, incidentNumber: true },
    });

    for (const related of samePerson) {
      links.push({
        incidentId,
        relatedIncidentId: related.id,
        similarityType: 'SAME_PERSON',
        detectedBy: 'SYSTEM',
        notes: 'Same injured person involved in another incident',
      });
    }
  }

  // Rule 4: Same equipment within 12 months
  // Equipment is tracked via contributing factors with EQUIPMENT_TOOLS category
  const equipmentFactorIds = await prisma.contributingFactor.findMany({
    where: {
      incidentId,
      factorType: { category: 'EQUIPMENT_TOOLS' },
    },
    select: { factorTypeId: true },
  });

  if (equipmentFactorIds.length > 0) {
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const factorIds = equipmentFactorIds.map((f) => f.factorTypeId);

    const sameEquipment = await prisma.incident.findMany({
      where: {
        id: { not: incidentId },
        incidentDate: { gte: twelveMonthsAgo },
        contributingFactors: {
          some: {
            factorTypeId: { in: factorIds },
          },
        },
      },
      select: { id: true, incidentNumber: true },
    });

    for (const related of sameEquipment) {
      links.push({
        incidentId,
        relatedIncidentId: related.id,
        similarityType: 'SAME_EQUIPMENT',
        detectedBy: 'SYSTEM',
        notes: 'Same equipment-related contributing factor within 12 months',
      });
    }
  }

  // Insert links, skipping duplicates
  const createdLinks = [];
  for (const link of links) {
    try {
      const created = await prisma.recurrenceLink.create({
        data: link,
        include: {
          relatedIncident: {
            select: { id: true, incidentNumber: true, title: true },
          },
        },
      });
      createdLinks.push(created);
    } catch (err) {
      // Skip unique constraint violations (duplicate links)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        continue;
      }
      throw err;
    }
  }

  return createdLinks;
}

export async function listAllLinks() {
  return prisma.recurrenceLink.findMany({
    where: { isDismissed: false },
    include: {
      incident: {
        select: { id: true, incidentNumber: true, title: true, incidentType: true, severity: true, incidentDate: true },
      },
      relatedIncident: {
        select: { id: true, incidentNumber: true, title: true, incidentType: true, severity: true, incidentDate: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getRecurrenceForIncident(incidentId: string) {
  const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!incident) throw new NotFoundError('Incident', incidentId);

  const [linksFrom, linksTo] = await Promise.all([
    prisma.recurrenceLink.findMany({
      where: { incidentId, isDismissed: false },
      include: {
        relatedIncident: {
          select: {
            id: true,
            incidentNumber: true,
            title: true,
            incidentDate: true,
            incidentType: true,
            severity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.recurrenceLink.findMany({
      where: { relatedIncidentId: incidentId, isDismissed: false },
      include: {
        incident: {
          select: {
            id: true,
            incidentNumber: true,
            title: true,
            incidentDate: true,
            incidentType: true,
            severity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { linksFrom, linksTo };
}

export async function getClusters() {
  const similarityTypes: SimilarityType[] = [
    'SAME_LOCATION',
    'SAME_TYPE',
    'SAME_ROOT_CAUSE',
    'SAME_EQUIPMENT',
    'SAME_PERSON',
  ];

  const clusters = await Promise.all(
    similarityTypes.map(async (type) => {
      const count = await prisma.recurrenceLink.count({
        where: { similarityType: type, isDismissed: false },
      });
      return { similarityType: type, count };
    })
  );

  const topPatterns = await prisma.recurrenceLink.groupBy({
    by: ['similarityType'],
    where: { isDismissed: false },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  return {
    clusters,
    topPatterns: topPatterns.map((p) => ({
      similarityType: p.similarityType,
      count: p._count.id,
    })),
  };
}

export async function createManualLink(data: ManualLinkData) {
  const [incident, relatedIncident] = await Promise.all([
    prisma.incident.findUnique({ where: { id: data.incidentId } }),
    prisma.incident.findUnique({ where: { id: data.relatedIncidentId } }),
  ]);

  if (!incident) throw new NotFoundError('Incident', data.incidentId);
  if (!relatedIncident) throw new NotFoundError('Related Incident', data.relatedIncidentId);

  return prisma.recurrenceLink.create({
    data: {
      incidentId: data.incidentId,
      relatedIncidentId: data.relatedIncidentId,
      similarityType: data.similarityType,
      detectedBy: 'MANUAL',
      notes: data.notes,
    },
    include: {
      incident: {
        select: { id: true, incidentNumber: true, title: true },
      },
      relatedIncident: {
        select: { id: true, incidentNumber: true, title: true },
      },
    },
  });
}

export async function dismissLink(id: string) {
  const link = await prisma.recurrenceLink.findUnique({ where: { id } });
  if (!link) throw new NotFoundError('RecurrenceLink', id);

  return prisma.recurrenceLink.update({
    where: { id },
    data: { isDismissed: true },
  });
}
