type PaginationOptions = {
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
};

type CalculatedPagination = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

const toPositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

export const calculatePagination = ({
  page,
  limit,
  sortBy,
  sortOrder,
}: PaginationOptions): CalculatedPagination => {
  const calculatedPage = toPositiveInteger(page, 1);
  const calculatedLimit = toPositiveInteger(limit, 10);

  return {
    page: calculatedPage,
    limit: calculatedLimit,
    skip: (calculatedPage - 1) * calculatedLimit,
    sortBy: typeof sortBy === "string" && sortBy ? sortBy : "createdAt",
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
  };
};
