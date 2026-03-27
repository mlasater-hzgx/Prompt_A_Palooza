import { PrismaClient, Division } from '@prisma/client';

const PROJECTS = [
  { projectNumber: 'PRJ-2024-001', name: 'BNSF Topeka Rail Maintenance', division: 'HCC' as Division },
  { projectNumber: 'PRJ-2024-002', name: 'UP Kansas City Switch Replacement', division: 'HCC' as Division },
  { projectNumber: 'PRJ-2024-003', name: 'CSX Atlanta Track Renewal', division: 'HRSI' as Division },
  { projectNumber: 'PRJ-2024-004', name: 'NS Norfolk Bridge Inspection', division: 'HRSI' as Division },
  { projectNumber: 'PRJ-2025-001', name: 'BNSF Denver Signal Upgrade', division: 'HCC' as Division },
  { projectNumber: 'PRJ-2025-002', name: 'Highway 71 Overlay', division: 'HSI' as Division },
];

export async function seedProjects(prisma: PrismaClient) {
  const projects = [];
  for (const p of PROJECTS) {
    const project = await prisma.project.create({ data: p });
    projects.push(project);
  }
  return projects;
}
