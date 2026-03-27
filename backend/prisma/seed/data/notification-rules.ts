import { PrismaClient, RailroadClient, IncidentType } from '@prisma/client';

const RULES: { railroadClient: RailroadClient; incidentType: IncidentType; windowMinutes: number }[] = [
  { railroadClient: 'BNSF', incidentType: 'INJURY', windowMinutes: 120 },
  { railroadClient: 'BNSF', incidentType: 'NEAR_MISS', windowMinutes: 1440 },
  { railroadClient: 'BNSF', incidentType: 'PROPERTY_DAMAGE', windowMinutes: 240 },
  { railroadClient: 'UP', incidentType: 'INJURY', windowMinutes: 15 },
  { railroadClient: 'UP', incidentType: 'NEAR_MISS', windowMinutes: 1440 },
  { railroadClient: 'UP', incidentType: 'PROPERTY_DAMAGE', windowMinutes: 120 },
  { railroadClient: 'CSX', incidentType: 'INJURY', windowMinutes: 60 },
  { railroadClient: 'CSX', incidentType: 'NEAR_MISS', windowMinutes: 480 },
  { railroadClient: 'CSX', incidentType: 'PROPERTY_DAMAGE', windowMinutes: 60 },
  { railroadClient: 'NS', incidentType: 'INJURY', windowMinutes: 120 },
  { railroadClient: 'NS', incidentType: 'NEAR_MISS', windowMinutes: 1440 },
  { railroadClient: 'NS', incidentType: 'PROPERTY_DAMAGE', windowMinutes: 120 },
];

export async function seedNotificationRules(prisma: PrismaClient) {
  for (const rule of RULES) {
    await prisma.notificationRule.create({ data: rule });
  }
}
