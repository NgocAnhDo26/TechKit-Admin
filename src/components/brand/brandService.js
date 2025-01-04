import { prisma } from '../../config/config.js';

// Fetch all brands
export async function fetchAllBrands() {
    return prisma.brand.findMany(
        {
            orderBy: {
                name: 'asc',  // Sort by id in ascending order
            }
        }
    );
}