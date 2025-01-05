import { prisma, cloudinary } from '../../config/config.js';
import { getImage } from '../util/util.js';

export async function createProduct(data, images) {
  const {
    name,
    brand,
    category,
    storage,
    cpu,
    screenSize,
    resolution,
    ram,
    graphicCard,
    description,
    price,
    priceSale,
    inStock,
    status,
  } = data;

  if (!name || !price || !brand || !category) {
    return {
      success: false,
      message: 'Tên, giá, thương hiệu và danh mục không được để trống',
    };
  }

  const existProduct = await prisma.product.findUnique({
    where: {
      name,
    },
    select: {
      id: true,
    },
  });

  if (existProduct) {
    return { success: false, message: 'Sản phẩm đã tồn tại' };
  }

  const brandName = await prisma.brand.upsert({
    where: { name: brand },
    update: {},
    create: { name: brand },
    select: { id: true },
  });

  const categoryName = await prisma.category.upsert({
    where: { name: category },
    update: {},
    create: { name: category },
    select: { id: true },
  });

  const newProduct = await prisma.product.create({
    data: {
      name: name,
      brand: {
        connect: { id: brandName.id },
      },
      category: {
        connect: { id: categoryName.id },
      },
      ...(storage && { storage: storage }),
      ...(cpu && { cpu: cpu }),
      ...(screenSize && { screen_size: screenSize }),
      ...(resolution && { resolution: resolution }),
      ...(ram && { ram: ram }),
      ...(graphicCard && { graphic_card: graphicCard }),
      ...(description && { description: description }),
      price: Number(price),
      ...(priceSale && { price_sale: Number(priceSale) }),
      ...(inStock && { in_stock: Number(inStock) }),
      ...(status && { status: status }),
    },
    select: { id: true },
  });

  // Upload images to cloudinary
  await Promise.all(
    images.map(async (image, idx) => {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'TechKit/product' }, (error, result) => {
            if (error) reject(error);
            resolve(result);
          })
          .end(image.buffer);
      });

      await prisma.product_image.create({
        data: {
          product_id: newProduct.id,
          public_id: result.public_id,
          is_profile_img: idx === 0,
        },
      });
    }),
  );

  return { success: true };
}

// fetch all products
export async function fetchProductWithQuery(query) {
  let filters = {
    AND: [],
  };

  // Pagination settings
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || 10;
  let offset = (page - 1) * limit;

  // Keyword search filters
  if (query.keyword) {
    filters.AND.push({ name: { contains: query.keyword } });
  }

  if (query.category) {
    filters.AND.push({
      category: {
        name: query.category,
      },
    });
  }

  if (query.brand) {
    filters.AND.push({ brand: { name: query.brand } });
  }

  // Prepare sorting
  let orderBy = {};
  if (query.order && query.sortBy) {
    orderBy[query.sortBy] = query.order;
  }

  const products = await prisma.product.findMany({
    where: filters,
    select: {
      id: true,
      name: true,
      price: true,
      price_sale: true,
      create_time: true,
      in_stock: true,
      sales: true,
      status: true,
      product_image: {
        select: { public_id: true, is_profile_img: true },
      },
      category: {
        select: { name: true },
      },
      brand: {
        select: { name: true },
      },
    },
    orderBy: orderBy,
  });

  if (!products.length) {
    return []; // Empty products
  }

  // Process products format
  const formattedProducts = formatProducts(products);

  // Compute total pages after filtering
  const totalProducts = formattedProducts.length;
  const totalPage = Math.ceil(totalProducts / limit);

  return {
    products: formattedProducts.slice(offset, offset + limit),
    totalPage,
    currentPage: page,
  };
}

export async function fetchProductById(id) {
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      name: true,
      price: true,
      price_sale: true,
      in_stock: true,
      status: true,
      ram: true,
      storage: true,
      cpu: true,
      screen_size: true,
      resolution: true,
      graphic_card: true,
      description: true,
      product_image: {
        select: { public_id: true, is_profile_img: true },
      },
      category: {
        select: { name: true, id: true },
      },
      brand: {
        select: { name: true, id: true },
      },
    },
  });

  if (!product) {
    return null;
  }

  return formatProducts([product])[0];
}

function formatProducts(products) {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    price_sale: product.price_sale,
    category: product.category.name,
    category_id: product.category.id,
    brand: product.brand.name,
    brand_id: product.brand.id,
    create_time: product.create_time,
    in_stock: product.in_stock,
    sales: product.sales,
    status: product.status,
    ram: product.ram,
    storage: product.storage,
    cpu: product.cpu,
    screen_size: product.screen_size,
    resolution: product.resolution,
    graphic_card: product.graphic_card,
    description: product.description,
    profile_img: getImage(
      product.product_image.find((img) => img.is_profile_img)?.public_id,
    ),
    images: product.product_image
      .filter((img) => !img.is_profile_img)
      .map((img) => getImage(img.public_id)),
  }));
}

// Update product information
export async function updateProduct(id, data) {
  const {
    name,
    brand_id,
    category_id,
    storage,
    cpu,
    screen_size,
    resolution,
    ram,
    graphic_card,
    description,
    price,
    price_sale,
    in_stock,
    status,
  } = data;

  if (!name || !price || !price_sale || !brand_id || !category_id) {
    return {
      success: false,
      message: 'Tên, giá, thương hiệu và danh mục không được để trống',
    };
  }

  const existProduct = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
    },
  });

  if (!existProduct) {
    return { success: false, message: 'Sản phẩm không tồn tại' };
  }

  await prisma.product.update({
    where: { id: Number(id) },
    data: {
      name: name,
      brand_id: parseInt(brand_id, 10),
      category_id: parseInt(category_id, 10),
      price: Number(price),
      ...(storage && { storage: storage }),
      ...(cpu && { cpu: cpu }),
      ...(screen_size && { screen_size: screen_size }),
      ...(resolution && { resolution: resolution }),
      ...(ram && { ram: ram }),
      ...(graphic_card && { graphic_card: graphic_card }),
      ...(description && { description: description }),
      ...(price_sale && { price_sale: Number(price_sale) }),
      ...(in_stock && { in_stock: Number(in_stock) }),
      ...(status && { status: status }),
    },
  });

  return { success: true };
}

// Update product profile image
export async function updateProductProfileImage(id, image) {
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      product_image: {
        select: { public_id: true },
        where: { is_profile_img: true },
      },
    },
  });

  if (!product) {
    return { success: false, message: 'Sản phẩm không tồn tại' };
  }

  try {
    // Upload new image to cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'TechKit/product' }, (error, result) => {
          if (error) reject(error);
          resolve(result);
        })
        .end(image.buffer);
    });

    // Delete old image from cloudinary
    await cloudinary.uploader.destroy(product.product_image[0].public_id);

    // Update product profile image
    await prisma.product_image.updateMany({
      where: {
        product_id: Number(id),
        is_profile_img: true,
      },
      data: {
        public_id: result.public_id,
      },
    });

    const resultImage = getImage(result.public_id);
    return { success: true, image: resultImage };
  } catch (error) {
    return {
      success: false,
      message: 'Cập nhật ảnh đại diện không thành công',
    };
  }
}

// Delete product image
export async function deleteProductImage(id, publicId) {
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      product_image: {
        select: { public_id: true },
      },
    },
  });

  if (!product) {
    return { success: false, message: 'Sản phẩm không tồn tại' };
  }

  try {
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(publicId);
    // Delete image from database
    await prisma.product_image.delete({
      where: {
        product_id_public_id: {
          product_id: Number(id),
          public_id: publicId,
        },
      },
    });
  } catch (error) {
    return { success: false, message: 'Xóa ảnh không thành công' };
  }

  return { success: true };
}

// Upload product images
export async function uploadProductImages(id, images) {
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    return { success: false, message: 'Sản phẩm không tồn tại' };
  }

  let resultImages = [];
  try {
    // Upload images to cloudinary
    await Promise.all(
      images.map(async (image) => {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: 'TechKit/product' }, (error, result) => {
              if (error) reject(error);
              resolve(result);
            })
            .end(image.buffer);
        });

        await prisma.product_image.create({
          data: {
            product_id: Number(id),
            public_id: result.public_id,
            is_profile_img: false,
          },
        });

        resultImages.push(getImage(result.public_id));
      }),
    );
  } catch (error) {
    return { success: false, message: 'Upload ảnh không thành công' };
  }

  return { success: true, images: resultImages };
}
