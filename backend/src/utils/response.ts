import { Response } from 'express';

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
  errors?: Array<{ field?: string; message: string }>;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>) {
  const response: ApiResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta
) {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: { pagination },
  };
  return res.status(200).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Array<{ field?: string; message: string }>
) {
  const response: ApiResponse<null> = {
    success: false,
    errors: errors ?? [{ message }],
  };
  return res.status(statusCode).json(response);
}

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  totalCount: number
): PaginationMeta {
  return {
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
