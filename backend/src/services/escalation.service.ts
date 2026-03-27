import { prisma } from '../config/database';
import { sendNotification } from './notification.service';
import { NotificationType } from '@prisma/client';
import { logger } from '../utils/logger';

export async function checkOverdueInvestigations() {
  const now = new Date();

  const overdueInvestigations = await prisma.investigation.findMany({
    where: {
      status: { in: ['NOT_STARTED', 'IN_PROGRESS', 'PENDING_REVIEW'] },
      targetCompletionDate: { lt: now },
    },
    include: {
      incident: { select: { id: true, incidentNumber: true, title: true, division: true } },
      leadInvestigator: { select: { id: true, name: true } },
    },
  });

  for (const inv of overdueInvestigations) {
    const daysOverdue = Math.floor((now.getTime() - inv.targetCompletionDate!.getTime()) / (1000 * 60 * 60 * 24));

    // Escalation chain
    if (daysOverdue >= 14) {
      // Notify Executive
      const executives = await prisma.user.findMany({ where: { role: 'EXECUTIVE', isActive: true } });
      for (const exec of executives) {
        await sendNotification({
          type: NotificationType.INVESTIGATION_OVERDUE,
          title: `Investigation critically overdue (${daysOverdue} days)`,
          message: `Investigation for ${inv.incident.incidentNumber} - ${inv.incident.title} is ${daysOverdue} days overdue. Escalated to executive level.`,
          userId: exec.id,
          incidentId: inv.incident.id,
        });
      }
    } else if (daysOverdue >= 7) {
      // Notify Division Manager
      const divManagers = await prisma.user.findMany({
        where: { role: 'DIVISION_MANAGER', division: inv.incident.division, isActive: true },
      });
      for (const mgr of divManagers) {
        await sendNotification({
          type: NotificationType.INVESTIGATION_OVERDUE,
          title: `Investigation overdue (${daysOverdue} days)`,
          message: `Investigation for ${inv.incident.incidentNumber} - ${inv.incident.title} is ${daysOverdue} days overdue.`,
          userId: mgr.id,
          incidentId: inv.incident.id,
        });
      }
    } else if (daysOverdue >= 3) {
      // Notify Safety Manager
      const safetyManagers = await prisma.user.findMany({
        where: { role: 'SAFETY_MANAGER', isActive: true },
      });
      for (const sm of safetyManagers) {
        await sendNotification({
          type: NotificationType.INVESTIGATION_OVERDUE,
          title: `Investigation overdue (${daysOverdue} days)`,
          message: `Investigation for ${inv.incident.incidentNumber} - ${inv.incident.title} is ${daysOverdue} days past target completion.`,
          userId: sm.id,
          incidentId: inv.incident.id,
        });
      }
    }

    logger.info({ investigationId: inv.id, daysOverdue }, 'Overdue investigation detected');
  }

  return overdueInvestigations.length;
}

export async function checkOverdueCapas() {
  const now = new Date();

  const overdueCapas = await prisma.capa.findMany({
    where: {
      status: { in: ['OPEN', 'IN_PROGRESS'] },
      dueDate: { lt: now },
    },
    include: {
      incident: { select: { id: true, incidentNumber: true, division: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  for (const capa of overdueCapas) {
    // Update status to OVERDUE if not already
    if (capa.status !== 'OVERDUE') {
      await prisma.capa.update({ where: { id: capa.id }, data: { status: 'OVERDUE' } });
    }

    const daysOverdue = Math.floor((now.getTime() - capa.dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // Notify assigned user
    if (capa.assignedTo) {
      await sendNotification({
        type: NotificationType.CAPA_OVERDUE,
        title: `CAPA ${capa.capaNumber} is overdue (${daysOverdue} days)`,
        message: `CAPA "${capa.title}" for incident ${capa.incident.incidentNumber} is ${daysOverdue} days past due date.`,
        userId: capa.assignedTo.id,
        incidentId: capa.incident.id,
      });
    }

    // Escalation chain (same pattern as investigations)
    if (daysOverdue >= 14) {
      const executives = await prisma.user.findMany({ where: { role: 'EXECUTIVE', isActive: true } });
      for (const exec of executives) {
        await sendNotification({
          type: NotificationType.CAPA_OVERDUE,
          title: `CAPA critically overdue (${daysOverdue} days)`,
          message: `CAPA ${capa.capaNumber} "${capa.title}" is ${daysOverdue} days overdue. Escalated to executive level.`,
          userId: exec.id,
          incidentId: capa.incident.id,
        });
      }
    } else if (daysOverdue >= 7) {
      const divManagers = await prisma.user.findMany({
        where: { role: 'DIVISION_MANAGER', division: capa.incident.division, isActive: true },
      });
      for (const mgr of divManagers) {
        await sendNotification({
          type: NotificationType.CAPA_OVERDUE,
          title: `CAPA overdue (${daysOverdue} days)`,
          message: `CAPA ${capa.capaNumber} "${capa.title}" is ${daysOverdue} days overdue.`,
          userId: mgr.id,
          incidentId: capa.incident.id,
        });
      }
    }

    logger.info({ capaId: capa.id, daysOverdue }, 'Overdue CAPA detected');
  }

  return overdueCapas.length;
}

export async function checkVerificationReminders() {
  const now = new Date();
  const reminderWindow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const capasNeedingVerification = await prisma.capa.findMany({
    where: {
      status: 'VERIFICATION_PENDING',
      verificationDueDate: { lte: reminderWindow, gte: now },
    },
    include: {
      incident: { select: { id: true, incidentNumber: true } },
    },
  });

  // Notify safety managers about upcoming verifications
  const safetyManagers = await prisma.user.findMany({
    where: { role: { in: ['SAFETY_MANAGER', 'SAFETY_COORDINATOR'] }, isActive: true },
  });

  for (const capa of capasNeedingVerification) {
    for (const sm of safetyManagers) {
      await sendNotification({
        type: NotificationType.CAPA_VERIFICATION_DUE,
        title: `CAPA ${capa.capaNumber} verification due soon`,
        message: `CAPA "${capa.title}" for incident ${capa.incident.incidentNumber} has a verification due date approaching.`,
        userId: sm.id,
        incidentId: capa.incident.id,
      });
    }
  }

  return capasNeedingVerification.length;
}

export async function checkClientNotificationDeadlines() {
  const now = new Date();

  // Find incidents with railroad clients that haven't been client-reported yet
  const unreportedIncidents = await prisma.incident.findMany({
    where: {
      railroadClient: { notIn: ['NA'] },
      clientReported: { not: true },
    },
    select: {
      id: true,
      incidentNumber: true,
      title: true,
      incidentType: true,
      railroadClient: true,
      reportedDate: true,
      division: true,
    },
  });

  const rules = await prisma.notificationRule.findMany();
  const ruleMap = new Map<string, number>();
  for (const rule of rules) {
    ruleMap.set(`${rule.railroadClient}_${rule.incidentType}`, rule.windowMinutes);
  }

  let notifiedCount = 0;
  for (const incident of unreportedIncidents) {
    const key = `${incident.railroadClient}_${incident.incidentType}`;
    const windowMinutes = ruleMap.get(key);

    if (windowMinutes !== undefined) {
      const deadline = new Date(incident.reportedDate.getTime() + windowMinutes * 60 * 1000);
      const minutesRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60);

      if (minutesRemaining <= 30 && minutesRemaining > 0) {
        // Approaching deadline
        const safetyCoordinators = await prisma.user.findMany({
          where: { role: { in: ['SAFETY_COORDINATOR', 'SAFETY_MANAGER'] }, isActive: true },
        });
        for (const sc of safetyCoordinators) {
          await sendNotification({
            type: NotificationType.CLIENT_DEADLINE,
            title: `Client notification deadline approaching: ${incident.railroadClient}`,
            message: `Incident ${incident.incidentNumber} requires ${incident.railroadClient} notification within ${Math.round(minutesRemaining)} minutes.`,
            userId: sc.id,
            incidentId: incident.id,
          });
        }
        notifiedCount++;
      } else if (minutesRemaining <= 0) {
        // Deadline passed
        const safetyManagers = await prisma.user.findMany({
          where: { role: 'SAFETY_MANAGER', isActive: true },
        });
        for (const sm of safetyManagers) {
          await sendNotification({
            type: NotificationType.CLIENT_DEADLINE,
            title: `CLIENT NOTIFICATION OVERDUE: ${incident.railroadClient}`,
            message: `Incident ${incident.incidentNumber} has MISSED the ${incident.railroadClient} notification deadline by ${Math.abs(Math.round(minutesRemaining))} minutes.`,
            userId: sm.id,
            incidentId: incident.id,
          });
        }
        notifiedCount++;
      }
    }
  }

  return notifiedCount;
}
