import { prisma } from '../config/database';
import { Prisma, Role, Division } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

interface UserFilters {
  role?: string;
  division?: string;
  isActive?: boolean;
  search?: string;
}

export async function listUsers(filters: UserFilters, skip: number, take: number) {
  const where: Prisma.UserWhereInput = {};

  if (filters.role) where.role = filters.role as Role;
  if (filters.division) where.division = filters.division as Division;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [users, count] = await Promise.all([
    prisma.user.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
    prisma.user.count({ where }),
  ]);

  return { users, count };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User', id);
  return user;
}

export async function updateUser(id: string, data: { role?: Role; division?: Division | null; isActive?: boolean }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User', id);
  return prisma.user.update({ where: { id }, data });
}

export async function deactivateUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User', id);
  return prisma.user.update({ where: { id }, data: { isActive: false } });
}

export async function getCurrentUser(id: string) {
  return getUserById(id);
}
