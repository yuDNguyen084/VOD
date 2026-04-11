export const getPrismaQuery = (query: any, searchFields: string[] = []) => {
  const { page = 1, limit = 10, sortBy = 'createdAt:desc', search, ...filters } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);
  const [field, order] = sortBy.split(':');
  
  let where: any = { ...filters };
  if (search && searchFields.length > 0) {
    where.OR = searchFields.map((f: string) => ({ [f]: { contains: search, mode: 'insensitive' } }));
  }
  return { where, orderBy: { [field]: order }, skip, take };
};