import { prisma } from '../config/database';

export async function generateIncidentNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const result = await prisma.$queryRaw<[{ last_seq: number }]>`
    INSERT INTO incident_number_sequences (year, last_seq)
    VALUES (${year}, 1)
    ON CONFLICT (year) DO UPDATE SET last_seq = incident_number_sequences.last_seq + 1
    RETURNING last_seq
  `;

  const seq = result[0].last_seq;
  return `INC-${year}-${String(seq).padStart(4, '0')}`;
}
