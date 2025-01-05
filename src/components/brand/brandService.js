import { prisma } from '../../config/config.js';

async function fetchAllBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        id: 'asc', // Sort by id in ascending order
      },
      select: { 
        id: true,
        name: true 
      },
    });
    return brands;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw new Error('Failed to fetch brands');
  }
}

async function addBrand(name) {
  try {
    // Check if the brand already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { name },
    });

    // If the brand already exists, throw an error
    if (existingBrand) {
      throw new Error('Brand already exists');
    }

    // If brand doesn't exist, create the new brand
    const newBrand = await prisma.brand.create({
      data: { name },
    });

    // Return the newly created brand
    return newBrand;
  } catch (error) {
    console.error('Error adding brand:', error.message || error);
    throw new Error(error.message || 'Failed to add brand');
  }
}

async function editBrand(brand_id, name) {
  try {
    // Check if the brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brand_id },
    });

    if (!existingBrand) {
      throw new Error('Brand not found');
    }

    // Check if the new name is different from the current name
    if (existingBrand.name === name) {
      throw new Error('New brand name is the same as the current one');
    }

    // Check if a brand with the new name already exists
    const duplicateBrand = await prisma.brand.findUnique({
      where: { name },
    });

    if (duplicateBrand) {
      throw new Error('Brand name already exists');
    }

    // Update the brand with the new name
    const updatedBrand = await prisma.brand.update({
      where: { id: brand_id },
      data: { name },
    });

    return updatedBrand;
  } catch (error) {
    console.error('Error updating brand:', error);
    throw new Error(error.message || 'Failed to update brand');
  }
}

async function deleteBrand(id) {
  try {
    const deletedBrand = await prisma.brand.delete({
      where: { id: id },
    });
    return deletedBrand;
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw new Error(error.message || 'Failed to delete brand');
  }
}

export { fetchAllBrands, addBrand, editBrand, deleteBrand };
