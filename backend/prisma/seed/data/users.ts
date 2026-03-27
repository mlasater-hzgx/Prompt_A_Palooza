import { PrismaClient, Role, Division } from '@prisma/client';

const USERS = [
  { name: 'John Martinez', email: 'john.martinez@herzog.com', role: 'ADMINISTRATOR' as Role, division: 'HCC' as Division, azureAdId: 'aad-001' },
  { name: 'Sarah Chen', email: 'sarah.chen@herzog.com', role: 'SAFETY_MANAGER' as Role, division: null, azureAdId: 'aad-002' },
  { name: 'Mike Thompson', email: 'mike.thompson@herzog.com', role: 'SAFETY_COORDINATOR' as Role, division: 'HCC' as Division, azureAdId: 'aad-003' },
  { name: 'Lisa Rodriguez', email: 'lisa.rodriguez@herzog.com', role: 'SAFETY_COORDINATOR' as Role, division: 'HRSI' as Division, azureAdId: 'aad-004' },
  { name: 'James Wilson', email: 'james.wilson@herzog.com', role: 'FIELD_REPORTER' as Role, division: 'HCC' as Division, azureAdId: 'aad-005' },
  { name: 'Emily Davis', email: 'emily.davis@herzog.com', role: 'FIELD_REPORTER' as Role, division: 'HRSI' as Division, azureAdId: 'aad-006' },
  { name: 'Robert Brown', email: 'robert.brown@herzog.com', role: 'PROJECT_MANAGER' as Role, division: 'HCC' as Division, azureAdId: 'aad-007' },
  { name: 'Patricia Johnson', email: 'patricia.johnson@herzog.com', role: 'DIVISION_MANAGER' as Role, division: 'HCC' as Division, azureAdId: 'aad-008' },
  { name: 'David Lee', email: 'david.lee@herzog.com', role: 'DIVISION_MANAGER' as Role, division: 'HRSI' as Division, azureAdId: 'aad-009' },
  { name: 'Jennifer Taylor', email: 'jennifer.taylor@herzog.com', role: 'EXECUTIVE' as Role, division: null, azureAdId: 'aad-010' },
];

export async function seedUsers(prisma: PrismaClient) {
  const users = [];
  for (const u of USERS) {
    const user = await prisma.user.create({ data: u });
    users.push(user);
  }
  return users;
}
