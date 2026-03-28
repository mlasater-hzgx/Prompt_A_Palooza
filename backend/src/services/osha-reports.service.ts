import { prisma } from '../config/database';

export async function generateOsha300(year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const incidents = await prisma.incident.findMany({
    where: {
      isOshaRecordable: true,
      incidentDate: { gte: startDate, lte: endDate },
    },
    include: {
      injuredPersons: true,
    },
    orderBy: { incidentDate: 'asc' },
  });

  return incidents.map((inc, index) => ({
    caseNumber: inc.oshaCaseNumber ?? `${index + 1}`,
    employeeName: inc.injuredPersons[0]?.name ?? 'N/A',
    jobTitle: inc.injuredPersons[0]?.jobTitle ?? 'N/A',
    date: inc.incidentDate.toISOString().split('T')[0],
    location: inc.jobSite ?? inc.locationDescription ?? 'N/A',
    description: inc.description.substring(0, 200),
    death: inc.severity === 'FATALITY',
    daysAway: inc.daysAway ?? 0,
    daysRestricted: inc.daysRestricted ?? 0,
    daysTransfer: inc.daysTransfer ?? 0,
    otherRecordable: inc.severity === 'MEDICAL_TREATMENT',
    injuryType: inc.injuredPersons[0]?.injuryType ?? 'OTHER',
    bodyPart: inc.injuredPersons[0]?.bodyPart ?? 'MULTIPLE',
  }));
}

export async function generateOsha300A(year: number) {
  const entries = await generateOsha300(year);

  const summary = {
    year,
    totalCases: entries.length,
    totalDeaths: entries.filter((e) => e.death).length,
    totalDaysAway: entries.reduce((sum, e) => sum + e.daysAway, 0),
    totalDaysRestricted: entries.reduce((sum, e) => sum + e.daysRestricted, 0),
    totalDaysTransfer: entries.reduce((sum, e) => sum + e.daysTransfer, 0),
    totalOtherRecordable: entries.filter((e) => e.otherRecordable).length,
    casesWithDaysAway: entries.filter((e) => e.daysAway > 0).length,
    casesWithRestriction: entries.filter((e) => e.daysRestricted > 0).length,
    casesWithTransfer: entries.filter((e) => e.daysTransfer > 0).length,
  };

  // Get hours worked for the year
  const hoursWorked = await prisma.hoursWorked.aggregate({
    where: { year },
    _sum: { hours: true },
  });

  return {
    ...summary,
    totalHoursWorked: Number(hoursWorked._sum.hours ?? 0),
  };
}

export async function generateAllOsha301(year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const incidents = await prisma.incident.findMany({
    where: {
      isOshaRecordable: true,
      incidentDate: { gte: startDate, lte: endDate },
    },
    include: {
      injuredPersons: true,
      reportedBy: { select: { name: true, email: true } },
    },
    orderBy: { incidentDate: 'asc' },
  });

  return incidents.map((incident) => {
    const injured = incident.injuredPersons[0];
    return {
      incidentNumber: incident.incidentNumber,
      employeeName: injured?.name ?? 'N/A',
      jobTitle: injured?.jobTitle ?? 'N/A',
      incidentDate: incident.incidentDate.toISOString().split('T')[0],
      incidentTime: incident.incidentTime?.toISOString().split('T')[1]?.substring(0, 5) ?? 'N/A',
      location: incident.jobSite ?? incident.locationDescription ?? 'N/A',
      description: incident.description.substring(0, 200),
      injuryDescription: injured ? `${injured.injuryType ?? 'Unknown'} to ${injured.bodyPart ?? 'unknown area'}` : 'N/A',
      treatmentType: injured?.treatmentType ?? 'N/A',
      treatmentFacility: injured?.treatmentFacility ?? 'N/A',
      physician: injured?.physician ?? 'N/A',
      hospitalized: injured?.treatmentType === 'HOSPITALIZATION' ? 'Yes' : 'No',
      reportedBy: incident.reportedBy.name,
      reportedDate: incident.reportedDate.toISOString().split('T')[0],
    };
  });
}

export async function generateOsha301(incidentId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      injuredPersons: true,
      reportedBy: { select: { name: true, email: true } },
    },
  });

  if (!incident) return null;

  const injured = incident.injuredPersons[0];

  return {
    incidentNumber: incident.incidentNumber,
    employeeName: injured?.name ?? 'N/A',
    employeeAddress: 'On file',
    dateOfBirth: 'On file',
    dateHired: 'On file',
    gender: 'On file',
    jobTitle: injured?.jobTitle ?? 'N/A',
    incidentDate: incident.incidentDate.toISOString().split('T')[0],
    incidentTime: incident.incidentTime?.toISOString().split('T')[1]?.substring(0, 5) ?? 'N/A',
    location: incident.jobSite ?? incident.locationDescription ?? 'N/A',
    whatHappened: incident.description,
    injuryDescription: injured ? `${injured.injuryType ?? 'Unknown'} to ${injured.bodyPart ?? 'unknown area'}` : 'N/A',
    objectOrSubstance: 'See incident description',
    treatmentType: injured?.treatmentType ?? 'N/A',
    treatmentFacility: injured?.treatmentFacility ?? 'N/A',
    physician: injured?.physician ?? 'N/A',
    wasEmployeeHospitalized: injured?.treatmentType === 'HOSPITALIZATION',
    reportedBy: incident.reportedBy.name,
    reportedByPhone: incident.reportedBy.email,
    reportedDate: incident.reportedDate.toISOString().split('T')[0],
  };
}
