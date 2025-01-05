import { prisma } from '../../config/config.js';

async function fetchAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc', // Sort by name in ascending order
      },
      select: { name: true },
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

async function addCategory(name) {
  try {
    // Check if the category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      throw new Error('Category already exists');
    }

    // If category doesn't exist, create the new category
    const newCategory = await prisma.category.create({
      data: { name },
    });

    return newCategory;
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error(error.message || 'Failed to add category');
  }
}

async function deleteCategory(category_id) {
  try {
    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }
    await prisma.category.delete({
      where: { id: category_id },
    });

    return { success: true, message: 'Category successfully deleted' };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error(error.message || 'Failed to delete category');
  }
}

export { fetchAllCategories, addCategory, deleteCategory };
