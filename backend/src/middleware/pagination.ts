import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      pagination: {
        page: number;
        pageSize: number;
        skip: number;
        take: number;
      };
    }
  }
}

export function pagination(defaultPageSize = 25, maxPageSize = 100) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(
      maxPageSize,
      Math.max(1, parseInt(req.query.pageSize as string) || defaultPageSize)
    );

    req.pagination = {
      page,
      pageSize,
      skip: (page - 1) * pageSize,
      take: pageSize,
    };

    next();
  };
}
