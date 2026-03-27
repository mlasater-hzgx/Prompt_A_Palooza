import { PrismaClient, FactorCategory } from '@prisma/client';

const FACTOR_TYPES = [
  { name: 'Inadequate Training', category: 'HUMAN_FACTORS' as FactorCategory, description: 'Insufficient training or certification for task' },
  { name: 'Failure to Follow Procedure', category: 'HUMAN_FACTORS' as FactorCategory, description: 'Known procedure not followed' },
  { name: 'Complacency', category: 'HUMAN_FACTORS' as FactorCategory, description: 'Routine task led to reduced attention' },
  { name: 'Fatigue', category: 'HUMAN_FACTORS' as FactorCategory, description: 'Worker fatigue contributed to incident' },
  { name: 'Communication Failure', category: 'HUMAN_FACTORS' as FactorCategory, description: 'Inadequate communication between workers or teams' },
  { name: 'Equipment Malfunction', category: 'EQUIPMENT_TOOLS' as FactorCategory, description: 'Equipment failed or did not perform as expected' },
  { name: 'Inadequate Maintenance', category: 'EQUIPMENT_TOOLS' as FactorCategory, description: 'Equipment not properly maintained' },
  { name: 'Improper Tool Use', category: 'EQUIPMENT_TOOLS' as FactorCategory, description: 'Wrong tool or improper use of correct tool' },
  { name: 'Weather Conditions', category: 'ENVIRONMENTAL' as FactorCategory, description: 'Adverse weather contributed to incident' },
  { name: 'Poor Lighting', category: 'ENVIRONMENTAL' as FactorCategory, description: 'Insufficient lighting at work area' },
  { name: 'Uneven Ground/Surface', category: 'ENVIRONMENTAL' as FactorCategory, description: 'Walking/working surface hazard' },
  { name: 'Inadequate Procedure', category: 'PROCEDURAL' as FactorCategory, description: 'Procedure did not address the hazard' },
  { name: 'Missing Procedure', category: 'PROCEDURAL' as FactorCategory, description: 'No procedure existed for the task' },
  { name: 'Inadequate Supervision', category: 'MANAGEMENT_ORGANIZATIONAL' as FactorCategory, description: 'Insufficient oversight of work' },
  { name: 'Resource Constraints', category: 'MANAGEMENT_ORGANIZATIONAL' as FactorCategory, description: 'Insufficient staffing, time, or budget' },
  { name: 'Inadequate Risk Assessment', category: 'MANAGEMENT_ORGANIZATIONAL' as FactorCategory, description: 'Hazards not identified in pre-job planning' },
];

export async function seedFactorTypes(prisma: PrismaClient) {
  const types = [];
  for (const ft of FACTOR_TYPES) {
    const t = await prisma.factorType.create({ data: ft });
    types.push(t);
  }
  return types;
}
