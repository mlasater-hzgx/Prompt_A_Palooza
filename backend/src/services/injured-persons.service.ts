import { prisma } from '../config/database';
import {
  Division,
  InjuryType,
  BodyPart,
  Side,
  TreatmentType,
} from '@prisma/client';
import { NotFoundError } from '../utils/errors';

interface CreateInjuredPersonData {
  name: string;
  employeeId?: string;
  jobTitle?: string;
  division?: Division;
  yearsExperience?: number;
  injuryType?: InjuryType;
  bodyPart?: BodyPart;
  side?: Side;
  treatmentType?: TreatmentType;
  treatmentFacility?: string;
  physician?: string;
  returnedToWork?: boolean;
  returnDate?: string;
  isSubcontractor?: boolean;
  subcontractorCompany?: string;
}

interface UpdateInjuredPersonData {
  name?: string;
  employeeId?: string;
  jobTitle?: string;
  division?: Division | null;
  yearsExperience?: number | null;
  injuryType?: InjuryType | null;
  bodyPart?: BodyPart | null;
  side?: Side | null;
  treatmentType?: TreatmentType | null;
  treatmentFacility?: string | null;
  physician?: string | null;
  returnedToWork?: boolean | null;
  returnDate?: string | null;
  isSubcontractor?: boolean;
  subcontractorCompany?: string | null;
}

export async function createInjuredPerson(incidentId: string, data: CreateInjuredPersonData) {
  const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!incident) throw new NotFoundError('Incident', incidentId);

  return prisma.injuredPerson.create({
    data: {
      incidentId,
      name: data.name,
      employeeId: data.employeeId,
      jobTitle: data.jobTitle,
      division: data.division,
      yearsExperience: data.yearsExperience,
      injuryType: data.injuryType,
      bodyPart: data.bodyPart,
      side: data.side,
      treatmentType: data.treatmentType,
      treatmentFacility: data.treatmentFacility,
      physician: data.physician,
      returnedToWork: data.returnedToWork,
      returnDate: data.returnDate ? new Date(data.returnDate) : undefined,
      isSubcontractor: data.isSubcontractor ?? false,
      subcontractorCompany: data.subcontractorCompany,
    },
  });
}

export async function updateInjuredPerson(id: string, data: UpdateInjuredPersonData) {
  const existing = await prisma.injuredPerson.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('InjuredPerson', id);

  return prisma.injuredPerson.update({
    where: { id },
    data: {
      ...data,
      returnDate: data.returnDate === null ? null : data.returnDate ? new Date(data.returnDate) : undefined,
    },
  });
}

export async function deleteInjuredPerson(id: string) {
  const existing = await prisma.injuredPerson.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('InjuredPerson', id);

  return prisma.injuredPerson.delete({ where: { id } });
}
