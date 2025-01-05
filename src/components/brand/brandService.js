import { prisma } from '../../config/config.js';

// Fetch all brands
export async function fetchAllBrands() {
  return prisma.brand.findMany({
    orderBy: {
      name: 'asc', // Sort by name in ascending order
    },
    select: { name: true },
  });
}
