export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}
