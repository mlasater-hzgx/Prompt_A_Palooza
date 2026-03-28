import { prisma } from '../config/database';
import {
  Prisma,
  InvestigationStatus,
  RootCauseMethod,
  ReviewAction,
  FishboneCategory,
  Division,
} from '@prisma/client';
import { NotFoundError, AppError } from '../utils/errors';
import { getInvestigationTargetDate } from '../utils/date';

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

interface InvestigationFilters {
  status?: string;
  leadInvestigatorId?: string;
  overdue?: boolean;
  division?: string;
}

// ---------------------------------------------------------------------------
// List investigations
// ---------------------------------------------------------------------------

export async function listInvestigations(
  filters: InvestigationFilters,
  skip: number,
  take: number,
) {
  const where: Prisma.InvestigationWhereInput = {};

  if (filters.status) {
    where.status = filters.status as InvestigationStatus;
  }
  if (filters.leadInvestigatorId) {
    where.leadInvestigatorId = filters.leadInvestigatorId;
  }
  if (filters.overdue) {
    where.targetCompletionDate = { lt: new Date() };
    where.status = { in: ['NOT_STARTED', 'IN_PROGRESS', 'PENDING_REVIEW'] };
  }
  if (filters.division) {
    where.incident = { division: filters.division as Division };
  }

  const [investigations, count] = await Promise.all([
    prisma.investigation.findMany({
      where,
      skip,
      take,
      orderBy: { targetCompletionDate: 'asc' },
      include: {
        incident: {
          select: {
            title: true,
            incidentNumber: true,
            severity: true,
            division: true,
          },
        },
        leadInvestigator: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.investigation.count({ where }),
  ]);

  return { investigations, count };
}

// ---------------------------------------------------------------------------
// Get investigation by ID (full detail)
// ---------------------------------------------------------------------------

export async function getInvestigationById(id: string) {
  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      incident: {
        select: {
          id: true,
          title: true,
          incidentNumber: true,
          severity: true,
          division: true,
          incidentType: true,
          incidentDate: true,
          status: true,
        },
      },
      leadInvestigator: {
        select: { id: true, name: true, email: true },
      },
      reviewedBy: {
        select: { id: true, name: true, email: true },
      },
      fiveWhyEntries: {
        orderBy: { sequence: 'asc' },
      },
      fishboneFactors: {
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      },
      capas: true,
    },
  });

  if (!investigation) throw new NotFoundError('Investigation', id);
  return investigation;
}

// ---------------------------------------------------------------------------
// Create investigation (1:1 with incident)
// ---------------------------------------------------------------------------

interface CreateInvestigationData {
  leadInvestigatorId?: string;
  investigationTeam?: string[];
  rootCauseMethod?: RootCauseMethod;
}

export async function createInvestigation(
  incidentId: string,
  data: CreateInvestigationData,
) {
  // Fetch the incident to validate it exists and get severity
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    select: { id: true, severity: true, status: true },
  });
  if (!incident) throw new NotFoundError('Incident', incidentId);

  // Check if investigation already exists
  const existing = await prisma.investigation.findUnique({
    where: { incidentId },
  });
  if (existing) {
    throw new AppError('An investigation already exists for this incident', 409);
  }

  const today = new Date();
  const targetDate = getInvestigationTargetDate(
    incident.severity ?? 'NEAR_MISS',
    today,
  );

  // Use a transaction to create the investigation and update the incident status
  const investigation = await prisma.$transaction(async (tx) => {
    const inv = await tx.investigation.create({
      data: {
        incidentId,
        leadInvestigatorId: data.leadInvestigatorId,
        investigationTeam: data.investigationTeam ?? [],
        rootCauseMethod: data.rootCauseMethod,
        status: 'IN_PROGRESS',
        startedDate: today,
        targetCompletionDate: targetDate,
      },
    });

    await tx.incident.update({
      where: { id: incidentId },
      data: { status: 'UNDER_INVESTIGATION' },
    });

    return inv;
  });

  return investigation;
}

// ---------------------------------------------------------------------------
// Update investigation
// ---------------------------------------------------------------------------

interface UpdateInvestigationData {
  leadInvestigatorId?: string | null;
  investigationTeam?: string[];
  investigationSummary?: string;
  rootCauseMethod?: RootCauseMethod | null;
  rootCauseSummary?: string;
  recommendations?: string;
  status?: InvestigationStatus;
}

export async function updateInvestigation(
  id: string,
  data: UpdateInvestigationData,
) {
  const investigation = await prisma.investigation.findUnique({ where: { id } });
  if (!investigation) throw new NotFoundError('Investigation', id);

  return prisma.investigation.update({ where: { id }, data });
}

// ---------------------------------------------------------------------------
// Submit review (approve / return)
// ---------------------------------------------------------------------------

export async function submitReview(
  id: string,
  reviewedById: string,
  reviewAction: ReviewAction,
  reviewComments?: string,
) {
  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: { incident: { select: { id: true } } },
  });
  if (!investigation) throw new NotFoundError('Investigation', id);

  if (reviewAction === 'APPROVED') {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.investigation.update({
        where: { id },
        data: {
          status: 'COMPLETE',
          completedDate: new Date(),
          reviewedById,
          reviewedDate: new Date(),
          reviewAction: 'APPROVED',
          reviewComments: reviewComments ?? null,
        },
      });

      await tx.incident.update({
        where: { id: investigation.incidentId },
        data: { status: 'INVESTIGATION_COMPLETE' },
      });

      return updated;
    });
  }

  // RETURNED
  return prisma.investigation.update({
    where: { id },
    data: {
      status: 'IN_PROGRESS',
      reviewedById: null,
      reviewedDate: null,
      reviewAction: 'RETURNED',
      reviewComments: reviewComments ?? null,
    },
  });
}

// ---------------------------------------------------------------------------
// Five-Why Analysis CRUD
// ---------------------------------------------------------------------------

interface FiveWhyData {
  sequence: number;
  question: string;
  answer: string;
  evidence?: string;
}

export async function addFiveWhy(investigationId: string, data: FiveWhyData) {
  const investigation = await prisma.investigation.findUnique({
    where: { id: investigationId },
  });
  if (!investigation) throw new NotFoundError('Investigation', investigationId);

  // Enforce max 7 entries
  const entryCount = await prisma.fiveWhyAnalysis.count({
    where: { investigationId },
  });
  if (entryCount >= 7) {
    throw new AppError('Maximum of 7 Five-Why entries per investigation', 400);
  }

  return prisma.fiveWhyAnalysis.create({
    data: {
      investigationId,
      sequence: data.sequence,
      question: data.question,
      answer: data.answer,
      evidence: data.evidence,
    },
  });
}

export async function updateFiveWhy(id: string, data: Partial<FiveWhyData>) {
  const entry = await prisma.fiveWhyAnalysis.findUnique({ where: { id } });
  if (!entry) throw new NotFoundError('FiveWhyAnalysis', id);

  return prisma.fiveWhyAnalysis.update({ where: { id }, data });
}

export async function deleteFiveWhy(id: string) {
  const entry = await prisma.fiveWhyAnalysis.findUnique({ where: { id } });
  if (!entry) throw new NotFoundError('FiveWhyAnalysis', id);

  return prisma.fiveWhyAnalysis.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Fishbone Factor CRUD
// ---------------------------------------------------------------------------

interface FishboneData {
  category: FishboneCategory;
  description: string;
  isContributing?: boolean;
  evidence?: string;
  sortOrder?: number;
}

export async function addFishboneFactor(
  investigationId: string,
  data: FishboneData,
) {
  const investigation = await prisma.investigation.findUnique({
    where: { id: investigationId },
  });
  if (!investigation) throw new NotFoundError('Investigation', investigationId);

  return prisma.fishboneFactor.create({
    data: {
      investigationId,
      category: data.category,
      description: data.description,
      isContributing: data.isContributing ?? false,
      evidence: data.evidence,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export async function updateFishboneFactor(
  id: string,
  data: Partial<FishboneData>,
) {
  const factor = await prisma.fishboneFactor.findUnique({ where: { id } });
  if (!factor) throw new NotFoundError('FishboneFactor', id);

  return prisma.fishboneFactor.update({ where: { id }, data });
}

export async function deleteFishboneFactor(id: string) {
  const factor = await prisma.fishboneFactor.findUnique({ where: { id } });
  if (!factor) throw new NotFoundError('FishboneFactor', id);

  return prisma.fishboneFactor.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Contributing Factor CRUD
// ---------------------------------------------------------------------------

interface ContributingFactorData {
  factorTypeId: string;
  description?: string;
  isPrimary?: boolean;
}

export async function addContributingFactor(
  incidentId: string,
  data: ContributingFactorData,
) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
  });
  if (!incident) throw new NotFoundError('Incident', incidentId);

  // Validate factorType exists
  const factorType = await prisma.factorType.findUnique({
    where: { id: data.factorTypeId },
  });
  if (!factorType) throw new NotFoundError('FactorType', data.factorTypeId);

  return prisma.contributingFactor.create({
    data: {
      incidentId,
      factorTypeId: data.factorTypeId,
      description: data.description,
      isPrimary: data.isPrimary ?? false,
    },
  });
}

export async function updateContributingFactor(
  id: string,
  data: Partial<ContributingFactorData>,
) {
  const factor = await prisma.contributingFactor.findUnique({ where: { id } });
  if (!factor) throw new NotFoundError('ContributingFactor', id);

  return prisma.contributingFactor.update({ where: { id }, data });
}

export async function deleteContributingFactor(id: string) {
  const factor = await prisma.contributingFactor.findUnique({ where: { id } });
  if (!factor) throw new NotFoundError('ContributingFactor', id);

  return prisma.contributingFactor.delete({ where: { id } });
}
