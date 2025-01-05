import { prisma } from '../../config/config.js';

async function fetchAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: 'asc', // Sort by name in ascending order
      },
      select: { 
        id: true,
        name: true 
      },
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

    // If the category already exists, throw an error
    if (existingCategory) {
      throw new Error('Category already exists');
    }

    // If category doesn't exist, create the new category
    const newCategory = await prisma.category.create({
      data: { name },
    });

    // Return the newly created category
    return newCategory;
  } catch (error) {
    console.error('Error adding category:', error.message || error);
    throw new Error(error.message || 'Failed to add category');
  }
}

async function editCategory(category_id, name) {
  try {
    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Check if the new name is different from the current name
    if (existingCategory.name === name) {
      throw new Error('New category name is the same as the current one');
    }

    // Check if a category with the new name already exists
    const duplicateCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (duplicateCategory) {
      throw new Error('Category name already exists');
    }

    // Update the category with the new name
    const updatedCategory = await prisma.category.update({
      where: { id: category_id },
      data: { name },
    });

    return updatedCategory;
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error(error.message || 'Failed to update category');
  }
}


async function deleteCategory(id) {
  try {
      const deletedCategory = await prisma.category.delete({
          where: { id: id },
      });
      return deletedCategory;
  } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error(error.message || 'Failed to delete category');
  }
}


export { fetchAllCategories, addCategory, deleteCategory, editCategory };
