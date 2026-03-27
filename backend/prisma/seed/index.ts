import { PrismaClient } from '@prisma/client';
import { seedUsers } from './data/users';
import { seedProjects } from './data/projects';
import { seedFactorTypes } from './data/factor-types';
import { seedNotificationRules } from './data/notification-rules';
import { seedSystemConfig } from './data/system-config';
import { seedIncidents } from './data/incidents';
import { seedInjuredPersons } from './data/injured-persons';
import { seedWitnessStatements } from './data/witness-statements';
import { seedInvestigations } from './data/investigations';
import { seedFiveWhy } from './data/five-why';
import { seedFishbone } from './data/fishbone';
import { seedContributingFactors } from './data/contributing-factors';
import { seedCapas } from './data/capas';
import { seedRecurrenceLinks } from './data/recurrence-links';
import { seedHoursWorked } from './data/hours-worked';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clear in reverse dependency order
  console.log('Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.recurrenceLink.deleteMany();
  await prisma.capa.deleteMany();
  await prisma.contributingFactor.deleteMany();
  await prisma.fishboneFactor.deleteMany();
  await prisma.fiveWhyAnalysis.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.witnessStatement.deleteMany();
  await prisma.injuredPerson.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.hoursWorked.deleteMany();
  await prisma.notificationRule.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.factorType.deleteMany();
  await prisma.userProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.capaNumberSequence.deleteMany();
  await prisma.incidentNumberSequence.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Existing data cleared\n');

  // Seed in dependency order
  const users = await seedUsers(prisma);
  console.log(`✓ ${users.length} users`);

  const projects = await seedProjects(prisma);
  console.log(`✓ ${projects.length} projects`);

  const factorTypes = await seedFactorTypes(prisma);
  console.log(`✓ ${factorTypes.length} factor types`);

  await seedNotificationRules(prisma);
  console.log('✓ notification rules');

  await seedSystemConfig(prisma);
  console.log('✓ system config');

  const incidents = await seedIncidents(prisma, users);
  console.log(`✓ ${incidents.length} incidents`);

  const injured = await seedInjuredPersons(prisma, incidents);
  console.log(`✓ ${injured.length} injured persons`);

  const statements = await seedWitnessStatements(prisma, incidents, users);
  console.log(`✓ ${statements.length} witness statements`);

  const investigations = await seedInvestigations(prisma, incidents, users);
  console.log(`✓ ${investigations.length} investigations`);

  const fiveWhys = await seedFiveWhy(prisma, investigations);
  console.log(`✓ ${fiveWhys.length} five-why entries`);

  const fishbone = await seedFishbone(prisma, investigations);
  console.log(`✓ ${fishbone.length} fishbone factors`);

  const factors = await seedContributingFactors(prisma, incidents, factorTypes);
  console.log(`✓ ${factors.length} contributing factors`);

  const capas = await seedCapas(prisma, incidents, investigations, users);
  console.log(`✓ ${capas.length} CAPAs`);

  const links = await seedRecurrenceLinks(prisma, incidents);
  console.log(`✓ ${links.length} recurrence links`);

  await seedHoursWorked(prisma);
  console.log('✓ hours worked');

  console.log('\n🌱 Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
