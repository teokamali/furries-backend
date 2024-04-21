import { PaginateQuery } from 'src/types/paginate.types';

export const paginate = (data: any[], paginate: PaginateQuery) => {
  const { limit, page } = paginate;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    data: data.slice(startIndex, endIndex),
    meta: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
    },
  };
};
