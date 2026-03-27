import { prisma } from '../config/database';
import {
  Prisma,
  CapaStatus,
  CapaPriority,
  ActionType,
  CapaCategory,
  VerificationResult,
} from '@prisma/client';
import { NotFoundError, AppError } from '../utils/errors';
import { generateCapaNumber } from '../utils/capa-number';
import { getCapaDueDate, addBusinessDays } from '../utils/date';

interface CapaFilters {
  status?: string;
  priority?: string;
  assignedToId?: string;
  overdue?: boolean;
  incidentId?: string;
}

interface CreateCapaData {
  title: string;
  description?: string;
  actionType: ActionType;
  category: CapaCategory;
  priority: CapaPriority;
  assignedToId?: string;
}

interface UpdateCapaData {
  title?: string;
  description?: string;
  actionType?: ActionType;
  category?: CapaCategory;
  priority?: CapaPriority;
  assignedToId?: string;
}

export async function listCapas(filters: CapaFilters, skip: number, take: number) {
  const where: Prisma.CapaWhereInput = {};

  if (filters.status) where.status = filters.status as CapaStatus;
  if (filters.priority) where.priority = filters.priority as CapaPriority;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.incidentId) where.incidentId = filters.incidentId;
  if (filters.overdue) {
    where.dueDate = { lt: new Date() };
    where.status = {
      notIn: ['COMPLETED', 'VERIFIED_EFFECTIVE', 'VERIFIED_INEFFECTIVE'],
    };
  }

  const [capas, count] = await Promise.all([
    prisma.capa.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        incident: {
          select: { incidentNumber: true, title: true },
        },
        assignedTo: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.capa.count({ where }),
  ]);

  return { capas, count };
}

export async function getCapaById(id: string) {
  const capa = await prisma.capa.findUnique({
    where: { id },
    include: {
      incident: {
        select: { id: true, incidentNumber: true, title: true, status: true },
      },
      investigation: {
        select: { id: true, status: true, rootCauseSummary: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      verifiedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  if (!capa) throw new NotFoundError('CAPA', id);
  return capa;
}

export async function createCapa(incidentId: string, data: CreateCapaData) {
  const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!incident) throw new NotFoundError('Incident', incidentId);

  const capaNumber = await generateCapaNumber();
  const now = new Date();
  const dueDate = getCapaDueDate(data.priority, now);

  return prisma.capa.create({
    data: {
      incidentId,
      capaNumber,
      title: data.title,
      description: data.description,
      actionType: data.actionType,
      category: data.category,
      priority: data.priority,
      dueDate,
      assignedToId: data.assignedToId,
      assignedDate: data.assignedToId ? now : undefined,
      status: 'OPEN',
    },
    include: {
      incident: {
        select: { incidentNumber: true, title: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function updateCapa(id: string, data: UpdateCapaData) {
  const existing = await prisma.capa.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('CAPA', id);

  const updateData: Prisma.CapaUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.actionType !== undefined) updateData.actionType = data.actionType;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.priority !== undefined) {
    updateData.priority = data.priority;
    updateData.dueDate = getCapaDueDate(data.priority, existing.createdAt);
  }
  if (data.assignedToId !== undefined) {
    updateData.assignedTo = { connect: { id: data.assignedToId } };
    if (!existing.assignedDate) {
      updateData.assignedDate = new Date();
    }
  }

  return prisma.capa.update({
    where: { id },
    data: updateData,
    include: {
      incident: {
        select: { incidentNumber: true, title: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function startCapa(id: string) {
  const capa = await prisma.capa.findUnique({ where: { id } });
  if (!capa) throw new NotFoundError('CAPA', id);

  if (capa.status !== 'OPEN') {
    throw new AppError(`Cannot start CAPA with status '${capa.status}'. Must be OPEN.`, 400);
  }

  return prisma.capa.update({
    where: { id },
    data: { status: 'IN_PROGRESS' },
  });
}

export async function completeCapa(
  id: string,
  completionNotes?: string,
  completionEvidence?: string[]
) {
  const capa = await prisma.capa.findUnique({ where: { id } });
  if (!capa) throw new NotFoundError('CAPA', id);

  if (capa.status !== 'IN_PROGRESS') {
    throw new AppError(
      `Cannot complete CAPA with status '${capa.status}'. Must be IN_PROGRESS.`,
      400
    );
  }

  const completedDate = new Date();
  const verificationDueDate = addBusinessDays(completedDate, 30);

  return prisma.capa.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedDate,
      completionNotes,
      completionEvidence: completionEvidence ?? [],
      verificationDueDate,
    },
  });
}

export async function verifyCapa(
  id: string,
  verifiedById: string,
  verificationResult: VerificationResult,
  verificationNotes?: string
) {
  const capa = await prisma.capa.findUnique({ where: { id } });
  if (!capa) throw new NotFoundError('CAPA', id);

  if (capa.status !== 'COMPLETED') {
    throw new AppError(
      `Cannot verify CAPA with status '${capa.status}'. Must be COMPLETED.`,
      400
    );
  }

  const newStatus: CapaStatus =
    verificationResult === 'INEFFECTIVE' ? 'VERIFIED_INEFFECTIVE' : 'VERIFIED_EFFECTIVE';

  return prisma.capa.update({
    where: { id },
    data: {
      status: newStatus,
      verifiedById,
      verifiedDate: new Date(),
      verificationResult,
      verificationNotes,
    },
    include: {
      verifiedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function getOverdueCapas() {
  return prisma.capa.findMany({
    where: {
      dueDate: { lt: new Date() },
      status: {
        notIn: ['COMPLETED', 'VERIFIED_EFFECTIVE', 'VERIFIED_INEFFECTIVE'],
      },
    },
    orderBy: { dueDate: 'asc' },
    include: {
      incident: {
        select: { incidentNumber: true, title: true },
      },
      assignedTo: {
        select: { name: true, email: true },
      },
    },
  });
}

export async function getCapaStats() {
  const statuses: CapaStatus[] = [
    'OPEN',
    'IN_PROGRESS',
    'COMPLETED',
    'VERIFICATION_PENDING',
    'VERIFIED_EFFECTIVE',
    'VERIFIED_INEFFECTIVE',
    'OVERDUE',
  ];

  const counts = await Promise.all(
    statuses.map(async (status) => {
      const count = await prisma.capa.count({ where: { status } });
      return { status, count };
    })
  );

  const overdueCount = await prisma.capa.count({
    where: {
      dueDate: { lt: new Date() },
      status: {
        notIn: ['COMPLETED', 'VERIFIED_EFFECTIVE', 'VERIFIED_INEFFECTIVE'],
      },
    },
  });

  return {
    byStatus: counts,
    overdue: overdueCount,
    total: counts.reduce((sum, c) => sum + c.count, 0),
  };
}
