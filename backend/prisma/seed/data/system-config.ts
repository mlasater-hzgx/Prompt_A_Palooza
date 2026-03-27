import { PrismaClient } from '@prisma/client';

export async function seedSystemConfig(prisma: PrismaClient) {
  const configs = [
    { key: 'trir_industry_benchmark', value: 3.0, description: 'Industry average TRIR for comparison' },
    { key: 'dart_industry_benchmark', value: 1.8, description: 'Industry average DART rate for comparison' },
    { key: 'leading_indicator_near_miss_rate', value: 30, description: 'Target near-miss reporting rate (%)' },
    { key: 'leading_indicator_capa_closure', value: 85, description: 'Target CAPA closure rate (%)' },
    { key: 'leading_indicator_investigation_timeliness', value: 90, description: 'Target investigation on-time completion (%)' },
  ];

  for (const cfg of configs) {
    await prisma.systemConfig.create({
      data: { key: cfg.key, value: cfg.value, description: cfg.description },
    });
  }
}
