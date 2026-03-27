import { prisma } from '../config/database';
import { Division, FactorCategory } from '@prisma/client';
import { NotFoundError, ConflictError } from '../utils/errors';

// ---- Projects ----
export async function listProjects(skip: number, take: number) {
  const [projects, count] = await Promise.all([
    prisma.project.findMany({ skip, take, orderBy: { projectNumber: 'asc' } }),
    prisma.project.count(),
  ]);
  return { projects, count };
}

export async function createProject(data: { projectNumber: string; name: string; division: Division }) {
  const existing = await prisma.project.findUnique({ where: { projectNumber: data.projectNumber } });
  if (existing) throw new ConflictError(`Project ${data.projectNumber} already exists`);
  return prisma.project.create({ data });
}

export async function updateProject(projectNumber: string, data: { name?: string; division?: Division; isActive?: boolean }) {
  const project = await prisma.project.findUnique({ where: { projectNumber } });
  if (!project) throw new NotFoundError('Project', projectNumber);
  return prisma.project.update({ where: { projectNumber }, data });
}

// ---- Hours Worked ----
export async function listHoursWorked(year?: number) {
  return prisma.hoursWorked.findMany({
    where: year ? { year } : {},
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { division: 'asc' }],
  });
}

export async function upsertHoursWorked(data: { division: Division | null; year: number; month: number; hours: number }) {
  return prisma.hoursWorked.upsert({
    where: {
      division_year_month: {
        division: data.division ?? ('HCC' as Division), // Prisma requires non-null for compound unique
        year: data.year,
        month: data.month,
      },
    },
    create: {
      division: data.division,
      year: data.year,
      month: data.month,
      hours: data.hours,
    },
    update: { hours: data.hours },
  });
}

// ---- System Config ----
export async function getSystemConfig() {
  return prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
}

export async function getConfigByKey(key: string) {
  return prisma.systemConfig.findUnique({ where: { key } });
}

export async function upsertSystemConfig(data: { key: string; value: unknown; description?: string }) {
  const jsonValue = JSON.parse(JSON.stringify(data.value));
  return prisma.systemConfig.upsert({
    where: { key: data.key },
    create: {
      key: data.key,
      value: jsonValue,
      description: data.description,
    },
    update: {
      value: jsonValue,
      description: data.description,
    },
  });
}

// ---- Factor Types ----
export async function listFactorTypes(activeOnly = true) {
  return prisma.factorType.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

export async function createFactorType(data: { name: string; category: FactorCategory; description?: string }) {
  return prisma.factorType.create({ data });
}

export async function updateFactorType(id: string, data: { name?: string; category?: FactorCategory; description?: string | null; isActive?: boolean }) {
  const factor = await prisma.factorType.findUnique({ where: { id } });
  if (!factor) throw new NotFoundError('FactorType', id);
  return prisma.factorType.update({ where: { id }, data });
}

export async function deleteFactorType(id: string) {
  const factor = await prisma.factorType.findUnique({ where: { id } });
  if (!factor) throw new NotFoundError('FactorType', id);
  // Soft delete
  return prisma.factorType.update({ where: { id }, data: { isActive: false } });
}

// ---- Notification Rules ----
export async function listNotificationRules() {
  return prisma.notificationRule.findMany({
    orderBy: [{ railroadClient: 'asc' }, { incidentType: 'asc' }],
  });
}

export async function upsertNotificationRule(data: { railroadClient: string; incidentType: string; windowMinutes: number }) {
  return prisma.notificationRule.upsert({
    where: {
      railroadClient_incidentType: {
        railroadClient: data.railroadClient as never,
        incidentType: data.incidentType as never,
      },
    },
    create: data as never,
    update: { windowMinutes: data.windowMinutes },
  });
}
