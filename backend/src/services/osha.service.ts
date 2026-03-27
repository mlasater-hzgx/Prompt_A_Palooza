import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

interface OshaDetermination {
  isOshaRecordable: boolean;
  isDart: boolean;
  reasons: string[];
}

export async function calculateOshaRecordability(incidentId: string): Promise<OshaDetermination> {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      injuredPersons: {
        select: {
          treatmentType: true,
        },
      },
    },
  });
  if (!incident) throw new NotFoundError('Incident', incidentId);

  let isOshaRecordable = false;
  let isDart = false;
  const reasons: string[] = [];

  // Check severity-based recordability
  if (incident.severity === 'FATALITY') {
    isOshaRecordable = true;
    isDart = true;
    reasons.push('Fatality incident');
  }

  if (incident.severity === 'LOST_TIME') {
    isOshaRecordable = true;
    isDart = true;
    reasons.push('Lost time incident - days away from work');
  }

  if (incident.severity === 'RESTRICTED_DUTY') {
    isOshaRecordable = true;
    isDart = true;
    reasons.push('Restricted duty incident');
  }

  if (incident.severity === 'MEDICAL_TREATMENT') {
    isOshaRecordable = true;
    reasons.push('Medical treatment beyond first aid');
  }

  // Check injured persons treatment types
  const recordableTreatments = ['ER_VISIT', 'HOSPITALIZATION', 'ONGOING_TREATMENT'] as const;
  for (const person of incident.injuredPersons) {
    if (
      person.treatmentType &&
      (recordableTreatments as readonly string[]).includes(person.treatmentType)
    ) {
      isOshaRecordable = true;
      reasons.push(`Injured person received ${person.treatmentType}`);
    }
  }

  // Update the incident with determination
  await prisma.incident.update({
    where: { id: incidentId },
    data: {
      isOshaRecordable,
      isDart,
    },
  });

  return { isOshaRecordable, isDart, reasons };
}

export async function overrideOsha(
  incidentId: string,
  overrideValue: boolean,
  justification: string,
  overrideById: string
) {
  const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!incident) throw new NotFoundError('Incident', incidentId);

  return prisma.incident.update({
    where: { id: incidentId },
    data: {
      oshaOverrideValue: overrideValue,
      oshaOverrideJustification: justification,
      oshaOverrideById: overrideById,
      oshaOverrideAt: new Date(),
    },
    select: {
      id: true,
      incidentNumber: true,
      isOshaRecordable: true,
      isDart: true,
      oshaOverrideValue: true,
      oshaOverrideJustification: true,
      oshaOverrideAt: true,
      oshaOverrideBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
