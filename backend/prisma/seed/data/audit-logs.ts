import { PrismaClient } from '@prisma/client';

export async function seedAuditLogs(
  prisma: PrismaClient,
  users: Array<{ id: string; name: string; role: string }>,
  incidents: Array<{ id: string; incidentNumber: string; status: string }>,
  investigations: Array<{ id: string; incidentId: string }>,
  capas: Array<{ id: string; incidentId: string; capaNumber: string; status: string }>,
) {
  const logs: Array<{
    entityType: string;
    entityId: string;
    action: string;
    changes: object | null;
    userId: string;
    incidentId: string | null;
    createdAt: Date;
  }> = [];

  // Helpers
  const admin = users.find((u) => u.role === 'ADMINISTRATOR')!;
  const safetyMgr = users.find((u) => u.role === 'SAFETY_MANAGER')!;
  const coordinators = users.filter((u) => u.role === 'SAFETY_COORDINATOR');
  const reporters = users.filter((u) => u.role === 'FIELD_REPORTER');

  function daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(Math.floor(Math.random() * 10) + 7, Math.floor(Math.random() * 60));
    return d;
  }

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]!;
  }

  // --- Incident creation logs (one per incident, spread over 18 months) ---
  for (let i = 0; i < incidents.length; i++) {
    const inc = incidents[i]!;
    const reporter = pick([...reporters, ...coordinators]);
    logs.push({
      entityType: 'Incident',
      entityId: inc.id,
      action: 'CREATED',
      changes: { incidentNumber: inc.incidentNumber, status: 'REPORTED' },
      userId: reporter.id,
      incidentId: inc.id,
      createdAt: daysAgo(540 - Math.floor((i / incidents.length) * 540)), // spread across 18 months
    });
  }

  // --- Status transitions for incidents that progressed ---
  const progressedIncidents = incidents.filter((i) => i.status !== 'REPORTED');
  for (const inc of progressedIncidents) {
    const coord = pick(coordinators);
    logs.push({
      entityType: 'Incident',
      entityId: inc.id,
      action: 'STATUS_CHANGED',
      changes: { from: 'REPORTED', to: 'UNDER_INVESTIGATION' },
      userId: coord.id,
      incidentId: inc.id,
      createdAt: daysAgo(Math.floor(Math.random() * 400) + 30),
    });
  }

  // --- Investigation creation logs ---
  for (const inv of investigations) {
    const coord = pick(coordinators);
    logs.push({
      entityType: 'Investigation',
      entityId: inv.id,
      action: 'CREATED',
      changes: { status: 'IN_PROGRESS' },
      userId: coord.id,
      incidentId: inv.incidentId,
      createdAt: daysAgo(Math.floor(Math.random() * 380) + 20),
    });
  }

  // --- Investigation completions ---
  for (const inv of investigations.slice(0, 16)) {
    logs.push({
      entityType: 'Investigation',
      entityId: inv.id,
      action: 'STATUS_CHANGED',
      changes: { from: 'IN_PROGRESS', to: 'COMPLETE' },
      userId: safetyMgr.id,
      incidentId: inv.incidentId,
      createdAt: daysAgo(Math.floor(Math.random() * 300) + 10),
    });
  }

  // --- Investigation reviews ---
  for (const inv of investigations.slice(0, 12)) {
    logs.push({
      entityType: 'Investigation',
      entityId: inv.id,
      action: 'UPDATED',
      changes: { reviewAction: 'APPROVED', reviewComments: 'Investigation thorough and complete.' },
      userId: safetyMgr.id,
      incidentId: inv.incidentId,
      createdAt: daysAgo(Math.floor(Math.random() * 280) + 5),
    });
  }

  // --- CAPA creation logs ---
  for (const capa of capas) {
    const coord = pick(coordinators);
    logs.push({
      entityType: 'Capa',
      entityId: capa.id,
      action: 'CREATED',
      changes: { capaNumber: capa.capaNumber, status: 'OPEN' },
      userId: coord.id,
      incidentId: capa.incidentId,
      createdAt: daysAgo(Math.floor(Math.random() * 350) + 15),
    });
  }

  // --- CAPA status changes ---
  const inProgressCapas = capas.filter((c) => c.status !== 'OPEN');
  for (const capa of inProgressCapas) {
    logs.push({
      entityType: 'Capa',
      entityId: capa.id,
      action: 'STATUS_CHANGED',
      changes: { from: 'OPEN', to: 'IN_PROGRESS' },
      userId: pick(coordinators).id,
      incidentId: capa.incidentId,
      createdAt: daysAgo(Math.floor(Math.random() * 300) + 10),
    });
  }

  const completedCapas = capas.filter((c) =>
    ['COMPLETED', 'VERIFICATION_PENDING', 'VERIFIED_EFFECTIVE', 'VERIFIED_INEFFECTIVE'].includes(c.status)
  );
  for (const capa of completedCapas) {
    logs.push({
      entityType: 'Capa',
      entityId: capa.id,
      action: 'STATUS_CHANGED',
      changes: { from: 'IN_PROGRESS', to: 'COMPLETED', completionNotes: 'Action completed per plan.' },
      userId: pick(coordinators).id,
      incidentId: capa.incidentId,
      createdAt: daysAgo(Math.floor(Math.random() * 200) + 5),
    });
  }

  const verifiedCapas = capas.filter((c) =>
    ['VERIFIED_EFFECTIVE', 'VERIFIED_INEFFECTIVE'].includes(c.status)
  );
  for (const capa of verifiedCapas) {
    logs.push({
      entityType: 'Capa',
      entityId: capa.id,
      action: 'STATUS_CHANGED',
      changes: { from: 'VERIFICATION_PENDING', to: capa.status, verificationResult: capa.status === 'VERIFIED_EFFECTIVE' ? 'EFFECTIVE' : 'INEFFECTIVE' },
      userId: safetyMgr.id,
      incidentId: capa.incidentId,
      createdAt: daysAgo(Math.floor(Math.random() * 100)),
    });
  }

  // --- User management logs ---
  logs.push({
    entityType: 'User',
    entityId: reporters[0]!.id,
    action: 'UPDATED',
    changes: { role: { from: 'FIELD_REPORTER', to: 'SAFETY_COORDINATOR' }, note: 'Promoted after certification' },
    userId: admin.id,
    incidentId: null,
    createdAt: daysAgo(200),
  });

  logs.push({
    entityType: 'User',
    entityId: admin.id,
    action: 'CREATED',
    changes: { name: admin.name, role: 'ADMINISTRATOR' },
    userId: admin.id,
    incidentId: null,
    createdAt: daysAgo(545),
  });

  // --- Config changes (entityId must be a valid UUID, use admin's ID as placeholder) ---
  logs.push({
    entityType: 'Config',
    entityId: admin.id,
    action: 'UPDATED',
    changes: { key: 'trir_industry_benchmark', from: 3.5, to: 3.0 },
    userId: admin.id,
    incidentId: null,
    createdAt: daysAgo(180),
  });

  logs.push({
    entityType: 'Config',
    entityId: admin.id,
    action: 'UPDATED',
    changes: { key: 'leading_indicator_capa_closure', from: 80, to: 85 },
    userId: safetyMgr.id,
    incidentId: null,
    createdAt: daysAgo(90),
  });

  // Sort by createdAt and insert
  logs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  for (const log of logs) {
    await prisma.auditLog.create({ data: log });
  }

  return logs;
}
