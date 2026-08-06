export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiError {
  message: string;

  errors?: Record<string, string[]>;
}

export interface Pagination {
  current_page: number;

  last_page: number;

  per_page: number;

  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];

  pagination: Pagination;
}