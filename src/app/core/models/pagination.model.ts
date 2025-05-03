export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export class PaginatedResult<T> {
  result!: T;
  pagination!: Pagination;
}

export interface GenericResponse<T> {
  data: T;
  success: boolean;
  message: string;
}
