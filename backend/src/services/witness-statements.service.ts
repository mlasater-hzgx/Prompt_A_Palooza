import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

interface CreateWitnessStatementData {
  witnessName: string;
  statementText: string;
  witnessTitle?: string;
  witnessEmployer?: string;
  witnessPhone?: string;
  statementDate?: string;
}

interface UpdateWitnessStatementData {
  witnessName?: string;
  statementText?: string;
  witnessTitle?: string | null;
  witnessEmployer?: string | null;
  witnessPhone?: string | null;
  statementDate?: string | null;
}

export async function createWitnessStatement(
  incidentId: string,
  collectedById: string,
  data: CreateWitnessStatementData
) {
  const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!incident) throw new NotFoundError('Incident', incidentId);

  return prisma.witnessStatement.create({
    data: {
      incidentId,
      collectedById,
      witnessName: data.witnessName,
      statementText: data.statementText,
      witnessTitle: data.witnessTitle,
      witnessEmployer: data.witnessEmployer,
      witnessPhone: data.witnessPhone,
      statementDate: data.statementDate ? new Date(data.statementDate) : undefined,
    },
    include: {
      collectedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function updateWitnessStatement(id: string, data: UpdateWitnessStatementData) {
  const existing = await prisma.witnessStatement.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('WitnessStatement', id);

  return prisma.witnessStatement.update({
    where: { id },
    data: {
      ...data,
      statementDate:
        data.statementDate === null
          ? null
          : data.statementDate
            ? new Date(data.statementDate)
            : undefined,
    },
    include: {
      collectedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function deleteWitnessStatement(id: string) {
  const existing = await prisma.witnessStatement.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('WitnessStatement', id);

  return prisma.witnessStatement.delete({ where: { id } });
}
