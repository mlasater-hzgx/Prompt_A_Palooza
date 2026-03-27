import { prisma } from '../config/database';
import {
  Prisma,
  IncidentType,
  Severity,
  IncidentStatus,
  Division,
  Shift,
  RailroadClient,
} from '@prisma/client';
import { NotFoundError, AppError } from '../utils/errors';
import { generateIncidentNumber } from '../utils/incident-number';
import { calculateCompletionPercentage } from '../utils/completion-percentage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IncidentFilters {
  incidentType?: string;
  severity?: string;
  status?: string;
  division?: string;
  projectNumber?: string;
  railroadClient?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  isDraft?: string;
}

interface CreateIncidentData {
  incidentType: IncidentType;
  incidentDate: Date;
  division: Division;
  description: string;
  title?: string;
  incidentTime?: string;
  projectNumber?: string;
  jobSite?: string;
  locationDescription?: string;
  latitude?: number;
  longitude?: number;
  immediateActionsTaken?: string;
  weatherConditions?: string;
  shift?: Shift;
  severity?: Severity;
  potentialSeverity?: Severity;
  railroadClient?: RailroadClient;
  photos?: string[];
}

interface UpdateIncidentData {
  title?: string;
  incidentType?: IncidentType;
  incidentDate?: Date;
  incidentTime?: string;
  division?: Division;
  description?: string;
  projectNumber?: string | null;
  jobSite?: string | null;
  locationDescription?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  immediateActionsTaken?: string | null;
  weatherConditions?: string | null;
  shift?: Shift | null;
  severity?: Severity | null;
  potentialSeverity?: Severity | null;
  railroadClient?: RailroadClient | null;
  photos?: string[];
}

// ---------------------------------------------------------------------------
// Allowed Status Transitions
// ---------------------------------------------------------------------------

const ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  REPORTED: [IncidentStatus.UNDER_INVESTIGATION],
  UNDER_INVESTIGATION: [IncidentStatus.INVESTIGATION_COMPLETE],
  INVESTIGATION_COMPLETE: [IncidentStatus.CAPA_ASSIGNED],
  CAPA_ASSIGNED: [IncidentStatus.CAPA_IN_PROGRESS],
  CAPA_IN_PROGRESS: [IncidentStatus.CLOSED],
  CLOSED: [IncidentStatus.REOPENED],
  REOPENED: [IncidentStatus.UNDER_INVESTIGATION],
};

// ---------------------------------------------------------------------------
// List Incidents
// ---------------------------------------------------------------------------

export async function listIncidents(
  filters: IncidentFilters,
  skip: number,
  take: number,
  scopedProjectNumbers?: string[],
  scopedDivision?: string,
) {
  const where: Prisma.IncidentWhereInput = {};

  if (filters.incidentType) where.incidentType = filters.incidentType as IncidentType;
  if (filters.severity) where.severity = filters.severity as Severity;
  if (filters.status) where.status = filters.status as IncidentStatus;
  if (filters.division) where.division = filters.division as Division;
  if (filters.projectNumber) where.projectNumber = filters.projectNumber;
  if (filters.railroadClient) where.railroadClient = filters.railroadClient as RailroadClient;

  if (filters.isDraft !== undefined) {
    where.isDraft = filters.isDraft === 'true';
  }

  // Date range filtering
  if (filters.startDate || filters.endDate) {
    where.incidentDate = {};
    if (filters.startDate) {
      where.incidentDate.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.incidentDate.lte = new Date(filters.endDate);
    }
  }

  // Full-text search across key fields
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { incidentNumber: { contains: filters.search, mode: 'insensitive' } },
      { jobSite: { contains: filters.search, mode: 'insensitive' } },
      { locationDescription: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Project-level scoping (e.g., for PROJECT_MANAGER)
  if (scopedProjectNumbers && scopedProjectNumbers.length > 0) {
    where.projectNumber = { in: scopedProjectNumbers };
  }

  // Division-level scoping (e.g., for DIVISION_MANAGER)
  if (scopedDivision) {
    where.division = scopedDivision as Division;
  }

  const [incidents, count] = await Promise.all([
    prisma.incident.findMany({
      where,
      skip,
      take,
      orderBy: { incidentDate: 'desc' },
      include: {
        reportedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { injuredPersons: true } },
      },
    }),
    prisma.incident.count({ where }),
  ]);

  return { incidents, count };
}

// ---------------------------------------------------------------------------
// Get Incident By ID (full detail)
// ---------------------------------------------------------------------------

export async function getIncidentById(id: string) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      reportedBy: { select: { id: true, name: true, email: true } },
      project: true,
      injuredPersons: true,
      witnessStatements: true,
      investigation: {
        include: {
          leadInvestigator: { select: { id: true, name: true, email: true } },
          reviewedBy: { select: { id: true, name: true, email: true } },
        },
      },
      contributingFactors: {
        include: { factorType: true },
      },
      capas: {
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      },
      recurrenceLinksFrom: {
        include: {
          relatedIncident: {
            select: {
              id: true,
              incidentNumber: true,
              title: true,
              incidentType: true,
              incidentDate: true,
              status: true,
            },
          },
        },
      },
      recurrenceLinksTo: {
        include: {
          incident: {
            select: {
              id: true,
              incidentNumber: true,
              title: true,
              incidentType: true,
              incidentDate: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!incident) throw new NotFoundError('Incident', id);
  return incident;
}

// ---------------------------------------------------------------------------
// Create Incident
// ---------------------------------------------------------------------------

export async function createIncident(data: CreateIncidentData, reportedById: string) {
  const incidentNumber = await generateIncidentNumber();

  // Auto-generate title if not provided
  const title = data.title || `${data.incidentType} - ${data.division} - ${incidentNumber}`;

  const completionPercentage = calculateCompletionPercentage({
    ...data,
    title,
  });

  const incident = await prisma.incident.create({
    data: {
      incidentNumber,
      title,
      incidentType: data.incidentType,
      incidentDate: data.incidentDate,
      incidentTime: data.incidentTime ? new Date(`1970-01-01T${data.incidentTime}`) : undefined,
      division: data.division,
      description: data.description,
      projectNumber: data.projectNumber,
      jobSite: data.jobSite,
      locationDescription: data.locationDescription,
      latitude: data.latitude,
      longitude: data.longitude,
      immediateActionsTaken: data.immediateActionsTaken,
      weatherConditions: data.weatherConditions,
      shift: data.shift,
      severity: data.severity,
      potentialSeverity: data.potentialSeverity,
      railroadClient: data.railroadClient,
      photos: data.photos ?? [],
      reportedById,
      isDraft: true,
      completionPercentage,
      status: IncidentStatus.REPORTED,
    },
    include: {
      reportedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return incident;
}

// ---------------------------------------------------------------------------
// Update Incident
// ---------------------------------------------------------------------------

export async function updateIncident(id: string, data: UpdateIncidentData) {
  const existing = await prisma.incident.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Incident', id);

  // Merge existing data with update for completion calculation
  const merged = { ...existing, ...data };
  const completionPercentage = calculateCompletionPercentage(merged as Record<string, unknown>);
  const isDraft = completionPercentage < 90 ? existing.isDraft : false;

  const updateData: Prisma.IncidentUpdateInput = {
    ...data,
    // Handle incidentTime conversion
    incidentTime: data.incidentTime !== undefined
      ? (data.incidentTime ? new Date(`1970-01-01T${data.incidentTime}`) : null)
      : undefined,
    completionPercentage,
    isDraft,
  };

  // Remove incidentTime from data before spread if we handle it separately
  delete (updateData as Record<string, unknown>).incidentTime;

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      title: data.title,
      incidentType: data.incidentType,
      incidentDate: data.incidentDate,
      incidentTime: data.incidentTime !== undefined
        ? (data.incidentTime ? new Date(`1970-01-01T${data.incidentTime}`) : null)
        : undefined,
      division: data.division,
      description: data.description,
      projectNumber: data.projectNumber,
      jobSite: data.jobSite,
      locationDescription: data.locationDescription,
      latitude: data.latitude,
      longitude: data.longitude,
      immediateActionsTaken: data.immediateActionsTaken,
      weatherConditions: data.weatherConditions,
      shift: data.shift,
      severity: data.severity,
      potentialSeverity: data.potentialSeverity,
      railroadClient: data.railroadClient,
      photos: data.photos,
      completionPercentage,
      isDraft,
    },
    include: {
      reportedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return incident;
}

// ---------------------------------------------------------------------------
// Complete Details (staged completion)
// ---------------------------------------------------------------------------

export async function completeDetails(id: string, data: UpdateIncidentData) {
  const existing = await prisma.incident.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Incident', id);

  const merged = { ...existing, ...data };
  const completionPercentage = calculateCompletionPercentage(merged as Record<string, unknown>);
  const isDraft = completionPercentage < 90 ? true : false;

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      title: data.title,
      incidentType: data.incidentType,
      incidentDate: data.incidentDate,
      incidentTime: data.incidentTime !== undefined
        ? (data.incidentTime ? new Date(`1970-01-01T${data.incidentTime}`) : null)
        : undefined,
      division: data.division,
      description: data.description,
      projectNumber: data.projectNumber,
      jobSite: data.jobSite,
      locationDescription: data.locationDescription,
      latitude: data.latitude,
      longitude: data.longitude,
      immediateActionsTaken: data.immediateActionsTaken,
      weatherConditions: data.weatherConditions,
      shift: data.shift,
      severity: data.severity,
      potentialSeverity: data.potentialSeverity,
      railroadClient: data.railroadClient,
      photos: data.photos,
      completionPercentage,
      isDraft,
    },
    include: {
      reportedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return incident;
}

// ---------------------------------------------------------------------------
// Transition Status
// ---------------------------------------------------------------------------

export async function transitionStatus(id: string, newStatus: IncidentStatus) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new NotFoundError('Incident', id);

  const allowed = ALLOWED_TRANSITIONS[incident.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from '${incident.status}' to '${newStatus}'. Allowed transitions: ${(allowed ?? []).join(', ') || 'none'}`,
      400,
    );
  }

  const updated = await prisma.incident.update({
    where: { id },
    data: { status: newStatus },
    include: {
      reportedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Get Incident Timeline (audit log)
// ---------------------------------------------------------------------------

export async function getIncidentTimeline(id: string) {
  // Verify the incident exists
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new NotFoundError('Incident', id);

  const timeline = await prisma.auditLog.findMany({
    where: { incidentId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return timeline;
}

// ---------------------------------------------------------------------------
// Get Incident Statements
// ---------------------------------------------------------------------------

export async function getIncidentStatements(id: string) {
  // Verify the incident exists
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new NotFoundError('Incident', id);

  const statements = await prisma.witnessStatement.findMany({
    where: { incidentId: id },
    include: {
      collectedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { statementDate: 'desc' },
  });

  return statements;
}
